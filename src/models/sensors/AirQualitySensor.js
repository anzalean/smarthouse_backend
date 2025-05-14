import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const airQualitySensorSchema = new mongoose.Schema({
  currentAQI: Number,
  currentPM25: Number,
  currentPM10: Number,
  dangerousAQI: Number, // Небезпечний індекс якості повітря
  dangerousPM25: Number, // Небезпечний рівень PM2.5
  dangerousPM10: Number, // Небезпечний рівень PM10
});

const AirQualitySensor = Sensor.discriminator(
  'air_quality_sensor',
  airQualitySensorSchema,
);

export default AirQualitySensor;