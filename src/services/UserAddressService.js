import { UserAddressRepository } from '../repositories/index.js';

class UserAddressService {
  async getUserAddressById(userAddressId) {
    const userAddress = await UserAddressRepository.findById(userAddressId);

    if (!userAddress) {
      throw new Error('User address not found');
    }

    return userAddress;
  }

  async getUserAddressesByUserId(userId) {
    return UserAddressRepository.find({ userId });
  }

  async getUserAddressesByAddressId(addressId) {
    return UserAddressRepository.find({ addressId });
  }

  /**
   * Get a user address record by user and address IDs
   * @param {string} userId - The user ID
   * @param {string} addressId - The address ID
   * @returns {Promise<Object|null>} - The user address record if found, or null
   */
  async getUserAddressByUserAndAddress(userId, addressId) {
    return UserAddressRepository.findOne({ userId, addressId });
  }

  async createUserAddress(userAddressData) {
    return UserAddressRepository.create(userAddressData);
  }

  async updateUserAddress(userAddressId, updateData) {
    const userAddress = await UserAddressRepository.findById(userAddressId);

    if (!userAddress) {
      throw new Error('User address not found');
    }

    return UserAddressRepository.update(userAddressId, updateData);
  }

  async deleteUserAddress(userAddressId) {
    const userAddress = await UserAddressRepository.findById(userAddressId);

    if (!userAddress) {
      throw new Error('User address not found');
    }

    return UserAddressRepository.delete(userAddressId);
  }

  async deleteUserAddressesByAddressId(addressId) {
    return UserAddressRepository.deleteMany({ addressId });
  }

  async deleteUserAddressesByUserId(userId) {
    return UserAddressRepository.deleteMany({ userId });
  }
}

export default new UserAddressService();
