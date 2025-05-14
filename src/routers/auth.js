import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  googleLoginValidation,
} from '../utils/validators/index.js';

const router = Router();

// Public auth routes
router.post(
  '/register',
  registerValidation,
  validateRequest,
  authController.register
);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify', authController.verify);
router.get('/verify-email', authController.verifyEmail);
router.post(
  '/forgot-password',
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword
);

// Google authentication routes
router.get('/google/url', authController.googleAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.post(
  '/google/login',
  googleLoginValidation,
  validateRequest,
  authController.googleLogin
);

export default router;
