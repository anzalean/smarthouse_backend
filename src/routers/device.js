import { Router } from 'express';
import * as deviceController from '../controllers/device.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createDeviceValidator,
  updateDeviceValidator,
} from '../utils/validators/index.js';

const router = Router();

// Protect all device routes with authentication
router.use(authenticate);

// Get all devices for a specific home
router.get('/home/:homeId', deviceController.getDevicesByHomeId);

// Get all devices for a specific room
router.get('/room/:roomId', deviceController.getDevicesByRoomId);

// Get a specific device by ID
router.get('/:id', deviceController.getDeviceById);

// Create a new device
router.post(
  '/',
  createDeviceValidator,
  validateRequest,
  deviceController.createDevice
);

// Update a device
router.put(
  '/:id',
  updateDeviceValidator,
  validateRequest,
  deviceController.updateDevice
);

// Delete a device
router.delete('/:id', deviceController.deleteDevice);

export default router;
