import BaseRepository from './BaseRepository.js';
import { UserAddress } from '../models/index.js';

class UserAddressRepository extends BaseRepository {
  constructor() {
    super(UserAddress);
  }

  async findByUserAndAddress(userId, addressId) {
    return this.findOne({ userId, addressId });
  }

  async findByUserId(userId) {
    return this.find({ userId });
  }

  async findByAddressId(addressId) {
    return this.find({ addressId });
  }

  async findPrimaryAddressByUserId(userId) {
    return this.findOne({ userId, isPrimary: true });
  }
}

export default new UserAddressRepository();
