import { Router } from 'express';

import authRouter from './auth.js';
import userRouter from './user.js';
import feedbackRouter from './feedback.js';
import homeRouter from './home.js';
import deviceRouter from './device.js';
import sensorRouter from './sensor.js';
import roomRouter from './room.js';
import emulatorRouter from './emulator.js';
import automationRouter from './automation.js';
import roleRouter from './role.js';
import logsRouter from './logs.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is live' });
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/feedback', feedbackRouter);
router.use('/home', homeRouter);
router.use('/device', deviceRouter);
router.use('/sensor', sensorRouter);
router.use('/room', roomRouter);
router.use('/emulator', emulatorRouter);
router.use('/automation', automationRouter);
router.use('/role', roleRouter);
router.use('/logs', logsRouter);

export default router;
