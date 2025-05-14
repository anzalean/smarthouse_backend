import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const waterLeakSensorSchema = new mongoose.Schema({
  currentWaterDetectionIndex: Number, // Поточний індекс виявлення води
  dangerousWaterDetectionIndex: Number, // Небезпечний індекс виявлення води  
});

const WaterLeakSensor = Sensor.discriminator(
  'water_leak_sensor',
  waterLeakSensorSchema,
);

export default WaterLeakSensor;