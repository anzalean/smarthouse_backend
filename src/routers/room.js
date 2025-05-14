import { Router } from 'express';
import * as roomController from '../controllers/room.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createRoomValidator,
  updateRoomValidator,
} from '../utils/validators/index.js';

const router = Router();

// Protect all room routes with authentication
router.use(authenticate);

// Get all rooms for a specific home
router.get('/', roomController.getRoomsByHome);

// Get a specific room by ID
router.get('/:id', roomController.getRoomById);

// Get room with devices and sensors
router.get('/:id/details', roomController.getRoomDetails);

// Create a new room
router.post(
  '/',
  createRoomValidator,
  validateRequest,
  roomController.createRoom
);

// Update a room
router.put(
  '/:id',
  updateRoomValidator,
  validateRequest,
  roomController.updateRoom
);

// Delete a room
router.delete('/:id', roomController.deleteRoom);

export default router;
