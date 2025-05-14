import mongoose from 'mongoose';
import Device from './Device.js';

const smartPlugSchema = new mongoose.Schema({
  currentLoad: Number, // Поточне навантаження в ватах
});

const SmartPlug = Device.discriminator('smart_plug', smartPlugSchema);
export default SmartPlug;
