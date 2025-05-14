import jwt from 'jsonwebtoken';
import {
  UserRepository,
  SessionRepository,
  RoleRepository,
  HomeAccessRepository,
} from '../repositories/index.js';
import { SESSION_STATUS, USER_STATUS } from '../constants/constants.js';
import { env } from '../utils/env.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const accessToken = req.cookies.accessToken;

    // Check if token exists
    if (!accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if session exists and is valid
    const session = await SessionRepository.findByAccessToken(accessToken);
    if (
      !session ||
      session.status !== SESSION_STATUS.ACTIVE ||
      session.accessTokenValidUntil < new Date()
    ) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, env('JWT_SECRET'));
    } catch (error) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    // Check if user exists
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Get isAdmin from JWT payload if it exists, otherwise check in DB
    let isAdmin = decoded.isAdmin;

    // If isAdmin not in token (for backward compatibility), check DB
    if (isAdmin === undefined) {
      const adminRole = await RoleRepository.findByName('admin');
      isAdmin = false;

      if (adminRole) {
        const homeAccess = await HomeAccessRepository.findOne({
          userId: user._id,
          roleId: adminRole._id,
          isActive: true,
        });
        isAdmin = Boolean(homeAccess);
      }
    }

    // Set user in request object
    req.user = {
      id: user._id,
      email: user.email,
      isAdmin,
    };

    // Update session last activity
    await SessionRepository.update(session._id, { lastActivity: new Date() });

    // Continue to the protected route
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Optional middleware to check for specific roles
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // For admin role
    if (roles.includes('admin')) {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      return next();
    }

    // For future role checking if needed
    // Currently, we only have admin role check implemented

    next();
  };
};
