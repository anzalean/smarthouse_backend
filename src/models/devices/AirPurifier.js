import mongoose from 'mongoose';
import Device from './Device.js';

const airPurifierSchema = new mongoose.Schema({
  currentMode: {
    type: String,
    enum: ['auto', 'manual', 'sleep', 'turbo', 'quiet'],
  },
  currentFanSpeed: Number,
  currentAirQuality: {
    pm25: Number,
    pm10: Number,
  },
});

const AirPurifier = Device.discriminator('air_purifier', airPurifierSchema);
export default AirPurifier;