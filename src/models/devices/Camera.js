import mongoose from 'mongoose';
import Device from './Device.js';

const cameraSchema = new mongoose.Schema({
  currentResolution: {
    width: Number,
    height: Number,
  },
});

const Camera = Device.discriminator('camera', cameraSchema);
export default Camera;