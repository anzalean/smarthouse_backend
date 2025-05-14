import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const weatherSensorSchema = new mongoose.Schema({
  currentTemperature: Number,
  currentHumidity: Number,
  currentPressure: Number,
  currentWindSpeed: Number,
  currentRainIntensity: Number,
  dangerousWindSpeed: Number, // Небезпечна швидкість вітру
  dangerousRainIntensity: Number, // Небезпечна інтенсивність дощу
  dangerousTemperaturePlus: Number, // Небезпечне значення температури
  dangerousTemperatureMinus: Number, // Небезпечне значення температури
});

const WeatherSensor = Sensor.discriminator(
  'weather_sensor',
  weatherSensorSchema
);

export default WeatherSensor;
