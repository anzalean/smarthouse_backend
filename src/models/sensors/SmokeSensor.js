import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const smokeSensorSchema = new mongoose.Schema({
  currentSmokeLevel: Number,
  dangerousSmokeLevel: Number, // Небезпечний рівень диму
});

const SmokeSensor = Sensor.discriminator('smoke_sensor', smokeSensorSchema);

export default SmokeSensor;