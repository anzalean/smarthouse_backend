import BaseRepository from './BaseRepository.js';
import { HomeAccess } from '../models/index.js';

class HomeAccessRepository extends BaseRepository {
  constructor() {
    super(HomeAccess);
  }

  async findByHomeId(homeId) {
    return this.find({ homeId });
  }

  async findByUserId(userId) {
    return this.find({ userId, isActive: true });
  }

  async findByHomeAndUser(homeId, userId) {
    return this.findOne({ homeId, userId, isActive: true });
  }
}

export default new HomeAccessRepository();
