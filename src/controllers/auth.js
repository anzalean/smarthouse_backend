import { env } from '../utils/env.js';
import {
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_TOKEN_LIFETIME_MS,
  COOKIE_SETTINGS,
} from '../constants/constants.js';
import { AuthService } from '../services/index.js';

// Helper to set secure cookies
const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const cookieSettings = {
    ...COOKIE_SETTINGS,
    domain:
      env('NODE_ENV') === 'production' ? env('APP_DOMAIN') : 'localhost',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieSettings,
    maxAge: ACCESS_TOKEN_LIFETIME_MS,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieSettings,
    maxAge: REFRESH_TOKEN_LIFETIME_MS,
  });
};

// Helper to clear auth cookies
const clearAuthCookies = res => {
  const cookieSettings = {
    ...COOKIE_SETTINGS,
    domain:
      env('NODE_ENV') === 'production' ? env('APP_DOMAIN') : 'localhost',
  };

  res.clearCookie('accessToken', cookieSettings);
  res.clearCookie('refreshToken', cookieSettings);
};

export const register = async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.login(email, password, req);

    // Set cookies
    setAuthCookies(res, tokens);

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const tokens = await AuthService.refresh(refreshToken, req);

    // Set new cookies
    setAuthCookies(res, tokens);

    res.json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await AuthService.logout(refreshToken);

    // Clear cookies
    clearAuthCookies(res);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies on error
    clearAuthCookies(res);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verify = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    const result = await AuthService.verify(accessToken);
    res.json(result);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ message: 'Verification token is required' });
    }

    const result = await AuthService.verifyEmail(token);

    // Set auth cookies if we have tokens
    if (result.tokens) {
      setAuthCookies(res, result.tokens);
    }

    // Redirect to the frontend main page with the access token as URL parameter for immediate authentication
    const redirectUrl = `${env('CLIENT_URL')}/main`;

    // Redirect to client application
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Email verification error:', error);

    // In case of error, redirect to login page with error message
    const redirectUrl = `${env('CLIENT_URL')}/login?error=verification_failed`;
    return res.redirect(redirectUrl);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await AuthService.forgotPassword(email);

    res.json({
      message:
        'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Return a 200 status regardless of error to prevent email enumeration
    res.json({
      message:
        'If an account with that email exists, a password reset link has been sent',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);

    // If login tokens are returned, set them as cookies
    if (result.tokens) {
      setAuthCookies(res, result.tokens);
    }

    res.json({
      message: 'Password reset successful',
      user: result.user,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Generate Google OAuth authorization URL
export const googleAuthUrl = async (req, res) => {
  try {
    const { generateAuthUrl } = await import('../utils/googleOAuth2.js');
    const url = generateAuthUrl();
    res.json({ url });
  } catch (error) {
    console.error('Google auth URL generation error:', error);
    res.status(500).json({ message: 'Failed to generate Google auth URL' });
  }
};

// Handle Google OAuth callback
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ message: 'Authorization code is required' });
    }

    const { validateCode } = await import('../utils/googleOAuth2.js');
    const googleData = await validateCode(code);

    const { user, tokens } = await AuthService.googleAuth(googleData);

    // Set cookies
    setAuthCookies(res, tokens);

    // Send the client URL to redirect to after successful authentication
    res.json({
      message: 'Google authentication successful',
      redirectUrl: `${env('CLIENT_URL')}/main`,
      user,
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(401).json({ message: error.message });
  }
};

// Authenticate with Google ID token (for mobile/client-side auth)
export const googleLogin = async (req, res) => {
  try {
    const { token, userInfo } = req.body;

    if (!token || !userInfo) {
      return res
        .status(400)
        .json({ message: 'Google token and user info are required' });
    }

    // Verify the token with Google's API
    try {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(env('GOOGLE_AUTH_CLIENT_ID'));

      // Verify the token by fetching the Google user info again on the server
      const response = await client.getTokenInfo(token);

      // Compare the fetched user ID with the one received from the client
      if (response.sub !== userInfo.sub) {
        throw new Error('User ID mismatch');
      }

      // If verification passed, we can use the user info from the client
      const googleData = {
        googleId: userInfo.sub,
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        isVerified: userInfo.email_verified || false,
        picture: userInfo.picture,
        fullPayload: userInfo,
      };

      const { user, tokens } = await AuthService.googleAuth(googleData);

      // Set cookies
      setAuthCookies(res, tokens);

      res.json({ user });
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid Google token' });
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: error.message });
  }
};
