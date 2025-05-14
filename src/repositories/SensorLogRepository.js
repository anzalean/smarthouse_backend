import BaseRepository from './BaseRepository.js';
import { SensorLog } from '../models/index.js';

class SensorLogRepository extends BaseRepository {
  constructor() {
    super(SensorLog);
  }

  async findByHomeId(homeId) {
    return this.find({ homeId });
  }

  async findBySensorId(sensorId) {
    return this.find({ sensorId });
  }
}

export default new SensorLogRepository();
