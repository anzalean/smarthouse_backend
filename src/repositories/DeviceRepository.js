import BaseRepository from './BaseRepository.js';
import { Device, getDeviceModel } from '../models/index.js';

class DeviceRepository extends BaseRepository {
  constructor() {
    super(Device);
  }

  async findByHomeId(homeId) {
    return this.find({ homeId });
  }

  async findByRoomId(roomId) {
    return this.find({ roomId });
  }

  async create(data) {
    // If deviceType is specified, use the appropriate model
    if (data.deviceType && data.deviceType !== 'Device') {
      const DeviceModel = getDeviceModel(data.deviceType);
      const device = new DeviceModel(data);
      await device.save();
      return device;
    }

    // Otherwise use the base Device model
    return super.create(data);
  }

  async update(id, updateData) {
    console.log('DeviceRepository.update - Starting update for device ID:', id);
    console.log(
      'DeviceRepository.update - Update data:',
      JSON.stringify(updateData, null, 2)
    );

    const device = await this.findById(id);
    console.log(
      'DeviceRepository.update - Found device:',
      JSON.stringify(device, null, 2)
    );

    if (!device) {
      console.log('DeviceRepository.update - Device not found');
      throw new Error('Device not found');
    }

    console.log('DeviceRepository.update - Device type:', device.deviceType);

    try {
      // Approach 1: Using Mongoose's direct save method
      console.log(
        'DeviceRepository.update - Using direct document update approach'
      );

      // Update all fields from updateData
      Object.keys(updateData).forEach(key => {
        device[key] = updateData[key];
      });

      // Update the updatedAt timestamp
      device.updatedAt = new Date();

      // Save the document
      await device.save();

      console.log(
        'DeviceRepository.update - Updated device:',
        JSON.stringify(device, null, 2)
      );
      return device;
    } catch (error) {
      console.error('DeviceRepository.update - Error updating device:', error);
      throw error;
    }
  }
}

export default new DeviceRepository();
