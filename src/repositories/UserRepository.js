import BaseRepository from './BaseRepository.js';
import { User } from '../models/index.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByGoogleId(googleId) {
    return this.findOne({ googleId });
  }

  async findByPhoneNumber(phoneNumber) {
    return this.findOne({ phoneNumber });
  }

  async findById(id, select = '') {
    return this.model.findById(id).select(select);
  }

  async updateResetPasswordToken(email, token, expires) {
    return this.model.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true }
    );
  }
}

export default new UserRepository();
