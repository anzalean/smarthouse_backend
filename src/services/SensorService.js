import { SensorRepository } from '../repositories/index.js';
import { EmulatorService } from '../emulator/index.js';

class SensorService {
  async getSensorById(sensorId) {
    const sensor = await SensorRepository.findById(sensorId);

    if (!sensor) {
      throw new Error('Sensor not found');
    }

    return sensor;
  }

  async getSensorsByHomeId(homeId) {
    return SensorRepository.findByHomeId(homeId);
  }

  async getSensorsByRoomId(roomId) {
    return SensorRepository.findByRoomId(roomId);
  }

  async createSensor(sensorData) {
    if (!sensorData.roomId) {
      throw new Error('Room ID is required');
    }

    if (!sensorData.homeId) {
      throw new Error('Home ID is required');
    }

    if (!sensorData.name) {
      throw new Error('Sensor name is required');
    }

    if (!sensorData.sensorType) {
      throw new Error('Sensor type is required');
    }

    // Generate initial current values for the sensor type via EmulatorService
    try {
      const enrichedData =
        EmulatorService.generateInitialSensorValues(sensorData);

      // Create the sensor with the enriched data
      const newSensor = await SensorRepository.create(enrichedData);

      console.log(
        `Successfully created ${sensorData.sensorType} with values:`,
        Object.keys(newSensor)
          .filter(key => key.startsWith('current'))
          .reduce((obj, key) => {
            obj[key] = newSensor[key];
            return obj;
          }, {})
      );

      return newSensor;
    } catch (error) {
      console.error('Error creating sensor:', error);
      throw new Error(`Failed to create sensor: ${error.message}`);
    }
  }

  async updateSensor(sensorId, sensorData) {
    const sensor = await SensorRepository.findById(sensorId);

    if (!sensor) {
      throw new Error('Sensor not found');
    }

    return SensorRepository.update(sensorId, {
      ...sensorData,
      updatedAt: new Date(),
    });
  }

  async deleteSensor(sensorId) {
    const sensor = await SensorRepository.findById(sensorId);

    if (!sensor) {
      throw new Error('Sensor not found');
    }

    return SensorRepository.delete(sensorId);
  }

  async deleteSensorsByHomeId(homeId) {
    return SensorRepository.deleteMany({ homeId });
  }
}

export default new SensorService();
