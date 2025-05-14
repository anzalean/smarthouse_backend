import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const motionSensorSchema = new mongoose.Schema({
  currentMotionIntensity: Number, // Рівень руху (0-100), де 0 - відсутність руху, 100 - максимальна інтенсивність
  dangerousMotionIntensity: Number, // Небезпечний рівень інтенсивності руху (0-100)
});

const MotionSensor = Sensor.discriminator('motion_sensor', motionSensorSchema);

export default MotionSensor;