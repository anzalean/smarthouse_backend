import mongoose from 'mongoose';
import Device from './Device.js';

const thermostatSchema = new mongoose.Schema({
  currentMode: {
    type: String,
    enum: ['heat', 'cool', 'auto', 'eco'],
  },
  currentTemperature: Number,
});

const Thermostat = Device.discriminator('thermostat', thermostatSchema);
export default Thermostat;
