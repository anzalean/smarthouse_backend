import BaseRepository from './BaseRepository.js';
import { DeviceLog } from '../models/index.js';

class DeviceLogRepository extends BaseRepository {
  constructor() {
    super(DeviceLog);
  }

  async findByHomeId(homeId) {
    return this.find({ homeId });
  }

  async findByDeviceId(deviceId) {
    return this.find({ deviceId });
  }
}

export default new DeviceLogRepository();
