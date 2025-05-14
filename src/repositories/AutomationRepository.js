import BaseRepository from './BaseRepository.js';
import Automation from '../models/Automation.js';

class AutomationRepository extends BaseRepository {
  constructor() {
    super(Automation);
  }

  async findByHomeId(homeId) {
    return this.find({ homeId });
  }

  async findActiveByHomeId(homeId) {
    return this.find({ homeId, isActive: true });
  }

  async findByTriggerType(homeId, triggerType) {
    return this.find({ homeId, triggerType });
  }
}

export default new AutomationRepository();
