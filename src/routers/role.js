import { Router } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getHomePermissions,
} from '../controllers/role.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createRoleValidator,
  updateRoleValidator,
  assignRoleValidator,
} from '../utils/validators/index.js';

const router = Router();

// Public routes (none for roles)

// Protected routes
router.get('/', authenticate, getAllRoles);
router.get('/home/:homeId/permissions', authenticate, getHomePermissions);
router.get('/:id', authenticate, getRoleById);

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  createRoleValidator,
  validateRequest,
  createRole
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  updateRoleValidator,
  validateRequest,
  updateRole
);

router.delete('/:id', authenticate, authorize(['admin']), deleteRole);

// Home owner routes
router.post(
  '/assign',
  authenticate,
  assignRoleValidator,
  validateRequest,
  assignRoleToUser
);

router.delete('/:homeId/user/:userId', authenticate, removeRoleFromUser);

export default router;
