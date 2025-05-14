import mongoose from 'mongoose';
import Device from './Device.js';

const heatingValveSchema = new mongoose.Schema({
  currentTemperature: Number,
});

const HeatingValve = Device.discriminator('heating_valve', heatingValveSchema);
export default HeatingValve;