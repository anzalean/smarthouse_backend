import { Router } from 'express';
import * as userController from '../controllers/user.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  updateUserValidator,
  changePasswordValidator,
  updateUserStatusValidator,
} from '../utils/validators/index.js';

const router = Router();

// Protect all user routes with authentication
router.use(authenticate);

// Standard user routes
router.get('/me', userController.getCurrentUser);
router.get('/:id', userController.getUserById);
router.put(
  '/:id',
  updateUserValidator,
  validateRequest,
  userController.updateUser
);
router.post(
  '/:id/change-password',
  changePasswordValidator,
  validateRequest,
  userController.changePassword
);
router.delete('/:id', userController.deleteUser);

// Admin-only routes
router.get('/admin/users', authorize(['admin']), userController.getAllUsers);
router.put(
  '/admin/users/:id/status',
  authorize(['admin']),
  updateUserStatusValidator,
  validateRequest,
  userController.updateUserStatus
);

export default router;
