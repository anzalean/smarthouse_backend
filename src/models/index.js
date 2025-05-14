import User from './User.js';
import Session from './Session.js';
import Role from './Role.js';
import Address from './Address.js';
import UserAddress from './UserAddress.js';
import Home from './Home.js';
import HomeAccess from './HomeAccess.js';
import Automation from './Automation.js';
import SensorLog from './SensorLog.js';
import DeviceLog from './DeviceLog.js';
import Room from './Room.js';

// Sensor models
import Sensor from './sensors/Sensor.js';
import TemperatureSensor from './sensors/TemperatureSensor.js';
import HumiditySensor from './sensors/HumiditySensor.js';
import MotionSensor from './sensors/MotionSensor.js';
import SmokeSensor from './sensors/SmokeSensor.js';
import WaterLeakSensor from './sensors/WaterLeakSensor.js';
import GasSensor from './sensors/GasSensor.js';
import AirQualitySensor from './sensors/AirQualitySensor.js';
import LightSensor from './sensors/LightSensor.js';
import PowerSensor from './sensors/PowerSensor.js';
import WeatherSensor from './sensors/WeatherSensor.js';

// Device models
import Device from './devices/Device.js';
import SmartPlug from './devices/SmartPlug.js';
import Thermostat from './devices/Thermostat.js';
import HeatingValve from './devices/HeatingValve.js';
import SmartLock from './devices/SmartLock.js';
import Gate from './devices/Gate.js';
import IrrigationSystem from './devices/IrrigationSystem.js';
import Ventilation from './devices/Ventilation.js';
import AirPurifier from './devices/AirPurifier.js';
import Camera from './devices/Camera.js';
import SmartLight from './devices/SmartLight.js';

// Map of device types to their model classes
const deviceModels = {
  AirPurifier,
  Camera,
  Gate,
  HeatingValve,
  IrrigationSystem,
  SmartLock,
  SmartPlug,
  Thermostat,
  Ventilation,
  SmartLight,
};

// Map of sensor types to their model classes
const sensorModels = {
  AirQualitySensor,
  GasSensor,
  HumiditySensor,
  LightSensor,
  MotionSensor,
  PowerSensor,
  SmokeSensor,
  TemperatureSensor,
  WaterLeakSensor,
  WeatherSensor,
};

// Function to get the appropriate device model based on type
const getDeviceModel = deviceType => {
  return deviceModels[deviceType] || Device;
};

// Function to get the appropriate sensor model based on type
const getSensorModel = sensorType => {
  return sensorModels[sensorType] || Sensor;
};

export {
  // Core models
  User,
  Session,
  Role,
  Address,
  UserAddress,
  Home,
  HomeAccess,
  Automation,
  Room,

  // Log models
  SensorLog,
  DeviceLog,

  // Sensor base model and specific sensors
  Sensor,
  TemperatureSensor,
  HumiditySensor,
  MotionSensor,
  SmokeSensor,
  WaterLeakSensor,
  GasSensor,
  AirQualitySensor,
  LightSensor,
  PowerSensor,
  WeatherSensor,

  // Device base model and specific devices
  Device,
  SmartPlug,
  Thermostat,
  HeatingValve,
  SmartLock,
  Gate,
  IrrigationSystem,
  Ventilation,
  AirPurifier,
  Camera,
  SmartLight,

  // Helper functions
  getDeviceModel,
  getSensorModel,
};
