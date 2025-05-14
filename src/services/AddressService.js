import { AddressRepository } from '../repositories/index.js';

class AddressService {
  async getAddressById(addressId) {
    const address = await AddressRepository.findById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  async getAddressByFields(fields) {
    return AddressRepository.findByFields(fields);
  }

  async createAddress(addressData) {
    return AddressRepository.create(addressData);
  }

  async updateAddress(addressId, updateData) {
    const address = await AddressRepository.findById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    return AddressRepository.update(addressId, updateData);
  }

  async deleteAddress(addressId) {
    const address = await AddressRepository.findById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    return AddressRepository.delete(addressId);
  }
}

export default new AddressService();
