import { SensorLogRepository } from '../repositories/index.js';

class SensorLogService {
  async getLogById(logId) {
    const log = await SensorLogRepository.findById(logId);

    if (!log) {
      throw new Error('Sensor log not found');
    }

    return log;
  }

  async getLogsBySensorId(sensorId, options = {}) {
    const { limit = 100, skip = 0, startDate, endDate } = options;

    const query = { sensorId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    return SensorLogRepository.find(query, {
      limit,
      skip,
      sort: { timestamp: -1 },
    });
  }

  async getLogsByHomeId(homeId, options = {}) {
    const { limit = 100, skip = 0, startDate, endDate, sensorType } = options;

    const query = { homeId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (sensorType) {
      query.sensorType = sensorType;
    }

    return SensorLogRepository.find(query, {
      limit,
      skip,
      sort: { timestamp: -1 },
    });
  }

  async createLog(logData) {
    if (!logData.sensorId || !logData.homeId || !logData.sensorType) {
      throw new Error('Sensor ID, Home ID, and Sensor Type are required');
    }

    return SensorLogRepository.create(logData);
  }

  /**
   * Create multiple sensor logs at once
   * @param {Array} logsData Array of log objects to create
   * @returns {Promise} Result of the insertion operation
   */
  async createBatchLogs(logsData) {
    if (!Array.isArray(logsData) || logsData.length === 0) {
      throw new Error('Array of log data is required');
    }

    // Validate each log entry
    for (const log of logsData) {
      if (!log.sensorId || !log.homeId || !log.sensorType) {
        throw new Error(
          'Each log must have Sensor ID, Home ID, and Sensor Type'
        );
      }
    }

    // Use MongoDB's insertMany for batch insertion
    return SensorLogRepository.createMany(logsData);
  }

  async deleteLogsByHomeId(homeId) {
    return SensorLogRepository.deleteMany({ homeId });
  }

  async deleteLogsBySensorId(sensorId) {
    return SensorLogRepository.deleteMany({ sensorId });
  }
}

export default new SensorLogService();
