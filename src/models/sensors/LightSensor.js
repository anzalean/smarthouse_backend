import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const lightSensorSchema = new mongoose.Schema({
  currentLux: Number,
  dangerousLux: Number, // Небезпечний рівень освітлення
});

const LightSensor = Sensor.discriminator('light_sensor', lightSensorSchema);

export default LightSensor;