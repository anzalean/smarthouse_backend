import { Router } from 'express';
import * as sensorController from '../controllers/sensor.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createSensorValidator,
  updateSensorValidator,
} from '../utils/validators/index.js';

const router = Router();

// Protect all sensor routes with authentication
router.use(authenticate);

// Get all sensors for a specific home
router.get('/home/:homeId', sensorController.getSensorsByHomeId);

// Get all sensors for a specific room
router.get('/room/:roomId', sensorController.getSensorsByRoomId);

// Get a specific sensor by ID
router.get('/:id', sensorController.getSensorById);

// Create a new sensor
router.post(
  '/',
  createSensorValidator,
  validateRequest,
  sensorController.createSensor
);

// Update a sensor
router.put(
  '/:id',
  updateSensorValidator,
  validateRequest,
  sensorController.updateSensor
);

// Delete a sensor
router.delete('/:id', sensorController.deleteSensor);

export default router;
