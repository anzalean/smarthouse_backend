import BaseRepository from './BaseRepository.js';
import { Address } from '../models/index.js';

class AddressRepository extends BaseRepository {
  constructor() {
    super(Address);
  }

  async findByFields(fields) {
    return this.findOne({
      country: fields.country,
      region: fields.region,
      city: fields.city,
      street: fields.street,
      buildingNumber: fields.buildingNumber,
      ...(fields.apartmentNumber && {
        apartmentNumber: fields.apartmentNumber,
      }),
    });
  }
}

export default new AddressRepository();
