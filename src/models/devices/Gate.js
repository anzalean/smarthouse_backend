import mongoose from 'mongoose';
import Device from './Device.js';

const gateSchema = new mongoose.Schema({
  currentPosition: {
    type: String,
    enum: ['open', 'closed'],
  },
});

const Gate = Device.discriminator('gate', gateSchema);
export default Gate;