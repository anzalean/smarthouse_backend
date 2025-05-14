import BaseRepository from './BaseRepository.js';
import { Sensor, getSensorModel } from '../models/index.js';

class SensorRepository extends BaseRepository {
  constructor() {
    super(Sensor);
  }

  async findByHomeId(homeId) {
    return this.find({ homeId });
  }

  async findByRoomId(roomId) {
    return this.find({ roomId });
  }

  async create(data) {
    // If sensorType is specified, use the appropriate model
    if (data.sensorType && data.sensorType !== 'Sensor') {
      const SensorModel = getSensorModel(data.sensorType);
      const sensor = new SensorModel(data);
      await sensor.save();
      return sensor;
    }

    // Otherwise use the base Sensor model
    return super.create(data);
  }

  async update(id, updateData) {
    console.log('SensorRepository.update - Starting update for sensor ID:', id);
    console.log(
      'SensorRepository.update - Update data:',
      JSON.stringify(updateData, null, 2)
    );

    const sensor = await this.findById(id);
    console.log(
      'SensorRepository.update - Found sensor:',
      JSON.stringify(sensor, null, 2)
    );

    if (!sensor) {
      console.log('SensorRepository.update - Sensor not found');
      throw new Error('Sensor not found');
    }

    console.log('SensorRepository.update - Sensor type:', sensor.sensorType);

    try {
      // Approach 1: Using Mongoose's direct save method
      console.log(
        'SensorRepository.update - Using direct document update approach'
      );

      // Update all fields from updateData
      Object.keys(updateData).forEach(key => {
        sensor[key] = updateData[key];
      });

      // Update the updatedAt timestamp
      sensor.updatedAt = new Date();

      // Save the document
      await sensor.save();

      console.log(
        'SensorRepository.update - Updated sensor:',
        JSON.stringify(sensor, null, 2)
      );
      return sensor;
    } catch (error) {
      console.error('SensorRepository.update - Error updating sensor:', error);
      throw error;
    }
  }
}

export default new SensorRepository();
