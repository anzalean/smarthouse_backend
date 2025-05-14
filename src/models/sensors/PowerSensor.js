import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const powerSensorSchema = new mongoose.Schema({
  currentPower: Number,
  currentVoltage: Number,
  currentCurrent: Number,
  dangerousPower: Number, // Небезпечний рівень потужності
  dangerousVoltage: Number, // Небезпечний рівень напруги
  dangerousCurrent: Number, // Небезпечний рівень струму
});

const PowerSensor = Sensor.discriminator('power_sensor', powerSensorSchema);

export default PowerSensor;