import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const humiditySensorSchema = new mongoose.Schema({
  currentHumidity: Number,
  dangerousHumidity: Number, // Небезпечне значення вологості
});

const HumiditySensor = Sensor.discriminator('humidity_sensor', humiditySensorSchema);

export default HumiditySensor;