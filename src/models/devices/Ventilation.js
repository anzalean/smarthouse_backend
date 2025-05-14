import mongoose from 'mongoose';
import Device from './Device.js';

const ventilationSchema = new mongoose.Schema({
  currentMode: {
    type: String,
    enum: ['auto', 'manual', 'boost', 'eco', 'night'],
  },
  currentFanSpeed: Number,
  currentAirflow: Number,
});

const Ventilation = Device.discriminator('ventilation', ventilationSchema);
export default Ventilation;