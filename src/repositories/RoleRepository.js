import BaseRepository from './BaseRepository.js';
import { Role } from '../models/index.js';

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(name) {
    return this.findOne({ name });
  }
}

export default new RoleRepository();
