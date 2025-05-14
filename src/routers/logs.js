import { Router } from 'express';
import deviceLogRouter from './deviceLog.js';
import sensorLogRouter from './sensorLog.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Protect all logs routes with authentication
router.use(authenticate);

// Mount sub-routers
router.use('/device', deviceLogRouter);
router.use('/sensor', sensorLogRouter);

export default router;
