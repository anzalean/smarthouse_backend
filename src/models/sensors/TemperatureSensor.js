import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const temperatureSensorSchema = new mongoose.Schema({
  currentTemperature: Number,
  dangerousTemperaturePlus:  Number, // Небезпечне значення температури
dangerousTemperatureMinus:  Number, // Небезпечне значення температури
  
 
});

const TemperatureSensor = Sensor.discriminator(
  'temperature_sensor',
  temperatureSensorSchema,
);

export default TemperatureSensor;