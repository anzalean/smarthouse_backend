import BaseRepository from './BaseRepository.js';
import { Room } from '../models/index.js';

class RoomRepository extends BaseRepository {
  constructor() {
    super(Room);
  }

  async findByHomeId(homeId, projection = {}) {
    return this.find({ homeId }, projection);
  }
}

export default new RoomRepository();
