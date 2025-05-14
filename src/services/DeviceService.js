import { DeviceRepository } from '../repositories/index.js';
import EmulatorService from '../emulator/EmulatorService.js';

class DeviceService {
  async getDeviceById(deviceId) {
    const device = await DeviceRepository.findById(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    return device;
  }

  async getDevicesByHomeId(homeId) {
    return DeviceRepository.findByHomeId(homeId);
  }

  async getDevicesByRoomId(roomId) {
    return DeviceRepository.findByRoomId(roomId);
  }

  async createDevice(deviceData) {
    if (!deviceData.roomId) {
      throw new Error('Room ID is required');
    }

    // Generate initial values for device based on type
    // This enriches the device data with appropriate values
    // for smart plugs (currentLoad) and potentially other device types
    if (deviceData.deviceType) {
      try {
        deviceData =
          await EmulatorService.generateInitialDeviceValues(deviceData);
      } catch (error) {
        console.error('Error generating initial device values:', error);
        // Continue with creation even if generation fails
      }
    }

    return DeviceRepository.create(deviceData);
  }

  async updateDevice(deviceId, deviceData) {
    const device = await DeviceRepository.findById(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    return DeviceRepository.update(deviceId, {
      ...deviceData,
      updatedAt: new Date(),
    });
  }

  async deleteDevice(deviceId) {
    const device = await DeviceRepository.findById(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    return DeviceRepository.delete(deviceId);
  }

  async deleteDevicesByHomeId(homeId) {
    return DeviceRepository.deleteMany({ homeId });
  }
}

export default new DeviceService();
