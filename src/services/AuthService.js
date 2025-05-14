import jwt from 'jsonwebtoken';
import {
  UserRepository,
  SessionRepository,
  RoleRepository,
  HomeAccessRepository,
} from '../repositories/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_TOKEN_LIFETIME_MS,
  SESSION_EXPIRY_MS,
  USER_STATUS,
  SESSION_STATUS,
  SMTP,
} from '../constants/constants.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import bcrypt from 'bcrypt';

class AuthService {
  // Helper function to generate tokens
  async generateTokens(user) {
    // Check if user has admin role
    const isAdmin = await this.checkUserIsAdmin(user._id);

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, isAdmin },
      env('JWT_SECRET'),
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign({ userId: user._id }, env('JWT_SECRET'), {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    // Calculate token expiry dates for database
    const now = new Date();
    const accessTokenValidUntil = new Date(
      now.getTime() + ACCESS_TOKEN_LIFETIME_MS
    );
    const refreshTokenValidUntil = new Date(
      now.getTime() + REFRESH_TOKEN_LIFETIME_MS
    );

    return {
      accessToken,
      refreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    };
  }

  // Helper to extract device info from request
  getDeviceInfo(req) {
    return {
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      browser: req.headers['user-agent'] || 'unknown',
      os: req.headers['sec-ch-ua-platform'] || 'unknown',
    };
  }

  async register(userData) {
    const { email, password, firstName, lastName, phoneNumber } = userData;

    // Check for existing user
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Check for existing phone number
    const existingPhone = await UserRepository.findByPhoneNumber(phoneNumber);
    if (existingPhone) {
      throw new Error('Phone number already in use');
    }

    // Create new user with unverified status
    const user = await UserRepository.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      status: USER_STATUS.UNVERIFIED,
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      env('JWT_SECRET'),
      { expiresIn: '24h' }
    );

    // Send verification email
    await this.sendVerificationEmail(user, verificationToken);

    // Don't send passwordHash in response
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
    };
  }

  async sendVerificationEmail(user, token) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const templatePath = path.join(__dirname, '../templates/verify-email.html');
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));

    const verificationLink = `${env('APP_DOMAIN')}/api/auth/verify-email?token=${token}`;
    const html = template({
      name: user.firstName,
      link: verificationLink,
    });

    await sendEmail({
      from: SMTP.SMTP_FROM,
      to: user.email,
      subject: 'Verify your email address',
      html,
    });
  }

  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, env('JWT_SECRET'));
      const user = await UserRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        return { isVerified: true };
      }

      await UserRepository.update(user._id, {
        status: USER_STATUS.ACTIVE,
        isVerified: true,
      });

      // Check if user has admin role
      const isAdmin = await this.checkUserIsAdmin(user._id);

      // Generate tokens for automatic login
      const {
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
      } = await this.generateTokens(user);

      // Create session in database (with minimal device info)
      const deviceInfo = {
        ip: 'email-verification',
        browser: 'email-verification',
        os: 'email-verification',
      };
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

      await SessionRepository.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
        deviceInfo,
        status: SESSION_STATUS.ACTIVE,
        lastActivity: new Date(),
        expiresAt,
      });

      return {
        isVerified: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }

  // Helper function to check if user has admin role
  async checkUserIsAdmin(userId) {
    // Find admin role
    const adminRole = await RoleRepository.findByName('admin');
    if (!adminRole) return false;

    // Check if user has this role in any home access
    const homeAccess = await HomeAccessRepository.findOne({
      userId,
      roleId: adminRole._id,
      isActive: true,
    });

    return Boolean(homeAccess);
  }

  async login(email, password, req) {
    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      throw new Error(
        'This account has been blocked. Please contact administrator.'
      );
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user has admin role
    const isAdmin = await this.checkUserIsAdmin(user._id);

    // Generate tokens
    const {
      accessToken,
      refreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    } = await this.generateTokens(user);

    // Create session in database
    const deviceInfo = this.getDeviceInfo(req);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

    await SessionRepository.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
      deviceInfo,
      status: SESSION_STATUS.ACTIVE,
      lastActivity: new Date(),
      expiresAt,
    });

    // Update user's last login timestamp
    await UserRepository.update(user._id, { lastLogin: new Date() });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        status: user.status,
        isAdmin,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(refreshToken, req) {
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    // Find session by refresh token
    const session = await SessionRepository.findByRefreshToken(refreshToken);

    if (
      !session ||
      session.status !== SESSION_STATUS.ACTIVE ||
      session.refreshTokenValidUntil < new Date()
    ) {
      throw new Error('Invalid or expired refresh token');
    }

    // Verify the refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, env('JWT_SECRET'));
    } catch (err) {
      // Invalidate the session if token is invalid
      await SessionRepository.invalidateSession(session._id);
      throw new Error('Invalid refresh token');
    }

    // Get the user from database
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      await SessionRepository.invalidateSession(session._id);
      throw new Error('User not found');
    }

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    } = await this.generateTokens(user);

    // Invalidate old session and create new one
    await SessionRepository.invalidateSession(session._id);

    // Create new session
    const deviceInfo = session.deviceInfo || this.getDeviceInfo(req);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

    await SessionRepository.create({
      userId: user._id,
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
      deviceInfo,
      status: SESSION_STATUS.ACTIVE,
      lastActivity: new Date(),
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    // Clear cookies regardless of token validity
    if (refreshToken) {
      await SessionRepository.invalidateSessionByRefreshToken(refreshToken);
    }
  }

  async verify(accessToken) {
    if (!accessToken) {
      throw new Error('No access token');
    }

    // Find session by access token
    const session = await SessionRepository.findByAccessToken(accessToken);

    if (
      !session ||
      session.status !== SESSION_STATUS.ACTIVE ||
      session.accessTokenValidUntil < new Date()
    ) {
      throw new Error('Invalid or expired access token');
    }

    // Verify the token
    let payload;
    try {
      payload = jwt.verify(accessToken, env('JWT_SECRET'));
    } catch (err) {
      throw new Error('Invalid access token');
    }

    // Get user from database
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      // Invalidate all user sessions
      await SessionRepository.invalidateAllUserSessions(user._id);
      throw new Error(
        'This account has been blocked. Please contact administrator.'
      );
    }

    // Check if user has admin role
    const isAdmin = await this.checkUserIsAdmin(user._id);

    // Update session last activity
    await SessionRepository.update(session._id, { lastActivity: new Date() });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        isAdmin,
      },
    };
  }

  async forgotPassword(email) {
    // Find user by email
    const user = await UserRepository.findByEmail(email);

    // If user doesn't exist, silently return to prevent email enumeration attacks
    if (!user) {
      return;
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign({ userId: user._id }, env('JWT_SECRET'), {
      expiresIn: '1h',
    });

    // Store reset token and expiry in user model
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await UserRepository.updateResetPasswordToken(
      user.email,
      resetToken,
      resetTokenExpiry
    );

    // Send reset email with token
    await this.sendPasswordResetEmail(user, resetToken);
  }

  async sendPasswordResetEmail(user, token) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const templatePath = path.join(
      __dirname,
      '../templates/reset-password-email.html'
    );
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));

    // The link will point to frontend reset page which will then call the API
    const resetLink = `${env('CLIENT_URL')}/reset-password?token=${token}`;
    const html = template({
      name: user.firstName,
      link: resetLink,
    });

    await sendEmail({
      from: SMTP.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  }

  async resetPassword(token, newPassword) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, env('JWT_SECRET'));

      // Find user by ID and valid reset token
      // We need to use the model directly to select the hidden fields
      const user = await UserRepository.model
        .findOne({
          _id: decoded.userId,
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: new Date() },
        })
        .select('+resetPasswordToken +resetPasswordExpires');

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash the new password before updating
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token fields
      await UserRepository.update(user._id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      // Check if user has admin role
      const isAdmin = await this.checkUserIsAdmin(user._id);

      // Generate tokens for automatic login
      const {
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
      } = await this.generateTokens(user);

      // Create session in database
      const deviceInfo = {
        ip: 'password-reset',
        browser: 'password-reset',
        os: 'password-reset',
      };
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

      await SessionRepository.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
        deviceInfo,
        status: SESSION_STATUS.ACTIVE,
        lastActivity: new Date(),
        expiresAt,
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid reset token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token has expired');
      }
      throw error;
    }
  }

  async getAllUserSessions(userId) {
    // Get all active sessions for user
    const sessions = await SessionRepository.findActiveSessionByUserId(userId);

    // Format response to exclude tokens
    return sessions.map(session => ({
      id: session._id,
      deviceInfo: session.deviceInfo,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
    }));
  }

  async revokeSession(sessionId) {
    await SessionRepository.invalidateSession(sessionId);
  }

  async revokeAllSessions(userId) {
    await SessionRepository.invalidateAllUserSessions(userId);
  }

  async googleAuth(googleData) {
    try {
      const {
        googleId,
        email,
        firstName,
        lastName,
        isVerified,
        picture,
        fullPayload,
      } = googleData;

      // First check if a user with this Google ID already exists
      let user = await UserRepository.findByGoogleId(googleId);

      // If no user with Google ID, check if user with same email exists
      if (!user) {
        user = await UserRepository.findByEmail(email);

        if (user) {
          // User exists but wasn't linked to Google yet - update their account
          user = await UserRepository.update(user._id, {
            googleId,
            googleProfile: fullPayload,
            isVerified: isVerified || user.isVerified,
          });
        } else {
          // Create a new user
          user = await UserRepository.create({
            email,
            firstName,
            lastName,
            googleId,
            googleProfile: fullPayload,
            isVerified: true, // Google-verified emails are considered verified
            status: USER_STATUS.ACTIVE,
          });
        }
      }

      // Check if this is a new or existing user after login with Google
      if (user) {
        // Check if user has admin role
        const isAdmin = await this.checkUserIsAdmin(user._id);

        // Generate tokens
        const {
          accessToken,
          refreshToken,
          accessTokenValidUntil,
          refreshTokenValidUntil,
        } = await this.generateTokens(user);

        // Create session with placeholder device info
        const deviceInfo = {
          ip: 'google-auth',
          browser: 'google-auth',
          os: 'google-auth',
        };

        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

        await SessionRepository.create({
          userId: user._id,
          accessToken,
          refreshToken,
          accessTokenValidUntil,
          refreshTokenValidUntil,
          deviceInfo,
          status: SESSION_STATUS.ACTIVE,
          lastActivity: new Date(),
          expiresAt,
        });

        // Update user's last login timestamp
        await UserRepository.update(user._id, { lastLogin: new Date() });

        return {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            isAdmin,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        };
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      throw new Error(error.message || 'Google authentication failed');
    }
  }
}

export default new AuthService();
