import { Router } from 'express';
import * as homeController from '../controllers/home.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createHomeValidator,
  updateHomeValidator,
} from '../utils/validators/index.js';

const router = Router();

// Protect all home routes with authentication
router.use(authenticate);

// Get all homes for the current user
router.get('/', homeController.getUserHomes);

// Get a specific home by ID
router.get('/:id', homeController.getHomeById);

// Create a new home
router.post(
  '/',
  createHomeValidator,
  validateRequest,
  homeController.createHome
);

// Update a home
router.put(
  '/:id',
  updateHomeValidator,
  validateRequest,
  homeController.updateHome
);

// Delete a home
router.delete('/:id', homeController.deleteHome);

export default router;
