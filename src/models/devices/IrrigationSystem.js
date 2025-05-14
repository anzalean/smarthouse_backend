import mongoose from 'mongoose';
import Device from './Device.js';

const irrigationSystemSchema = new mongoose.Schema({
  currentWaterFlow: Number,
});

const IrrigationSystem = Device.discriminator(
  'irrigation_system',
  irrigationSystemSchema,
);
export default IrrigationSystem;