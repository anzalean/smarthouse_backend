import { DeviceLogRepository } from '../repositories/index.js';

class DeviceLogService {
  async getLogById(logId) {
    const log = await DeviceLogRepository.findById(logId);

    if (!log) {
      throw new Error('Device log not found');
    }

    return log;
  }

  async getLogsByDeviceId(deviceId, options = {}) {
    const { limit = 100, skip = 0, startDate, endDate } = options;

    const query = { deviceId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    return DeviceLogRepository.find(query, {
      limit,
      skip,
      sort: { timestamp: -1 },
    });
  }

  async getLogsByHomeId(homeId, options = {}) {
    const { limit = 100, skip = 0, startDate, endDate, deviceType } = options;

    const query = { homeId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (deviceType) {
      query.deviceType = deviceType;
    }

    return DeviceLogRepository.find(query, {
      limit,
      skip,
      sort: { timestamp: -1 },
    });
  }

  async createLog(logData) {
    if (!logData.deviceId || !logData.homeId || !logData.deviceType) {
      throw new Error('Device ID, Home ID, and Device Type are required');
    }

    return DeviceLogRepository.create(logData);
  }

  async deleteLogsByDeviceId(deviceId) {
    return DeviceLogRepository.deleteMany({ deviceId });
  }

  async deleteLogsByHomeId(homeId) {
    return DeviceLogRepository.deleteMany({ homeId });
  }
}

export default new DeviceLogService();
