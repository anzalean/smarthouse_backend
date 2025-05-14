import mongoose from 'mongoose';
import Device from './Device.js';

const smartLockSchema = new mongoose.Schema({
  currentDoorState: {
    type: String,
    enum: ['open', 'closed'],
  },

});

const SmartLock = Device.discriminator('smart_lock', smartLockSchema);
export default SmartLock;