import { SensorService } from '../services/index.js';

export const getSensorById = async (req, res) => {
  try {
    const sensor = await SensorService.getSensorById(req.params.id);
    res.status(200).json(sensor);
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const getSensorsByHomeId = async (req, res) => {
  try {
    const sensors = await SensorService.getSensorsByHomeId(req.params.homeId);
    res.status(200).json(sensors);
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const getSensorsByRoomId = async (req, res) => {
  try {
    const sensors = await SensorService.getSensorsByRoomId(req.params.roomId);
    res.status(200).json(sensors);
  } catch (error) {
    console.error('Get sensors by room error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const createSensor = async (req, res) => {
  try {
    // Ensure sensorType is properly set
    if (!req.body.sensorType) {
      return res.status(400).json({
        message:
          'Sensor type is required. Supported types: AirQualitySensor, GasSensor, HumiditySensor, LightSensor, MotionSensor, PowerSensor, SmokeSensor, TemperatureSensor, WaterLeakSensor, WeatherSensor',
      });
    }

    const sensor = await SensorService.createSensor(req.body);
    res.status(201).json({
      message: 'Sensor created successfully',
      sensor,
    });
  } catch (error) {
    console.error('Create sensor error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateSensor = async (req, res) => {
  try {
    const updatedSensor = await SensorService.updateSensor(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedSensor);
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteSensor = async (req, res) => {
  try {
    await SensorService.deleteSensor(req.params.id);
    res.status(200).json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    console.error('Delete sensor error:', error);
    res.status(404).json({ message: error.message });
  }
};
