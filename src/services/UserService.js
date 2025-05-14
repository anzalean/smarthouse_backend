import {
  UserRepository,
  HomeRepository,
  SessionRepository,
} from '../repositories/index.js';
import {
  DeviceService,
  SensorService,
  DeviceLogService,
  SensorLogService,
  AutomationService,
  HomeAccessService,
  AddressService,
  UserAddressService,
  RoomService,
} from './index.js';
import bcrypt from 'bcrypt';

class UserService {
  async getUserById(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get a user by their email address
   * @param {string} email - The email address to search for
   * @returns {Promise<Object|null>} - The user object if found, null otherwise
   */
  async getUserByEmail(email) {
    const user = await UserRepository.findOne({ email: email.toLowerCase() });

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async updateUser(userId, userData) {
    // Get the current user
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Fields that can be updated
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber'];

    // Filter out invalid update fields
    const updates = {};
    Object.keys(userData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = userData[key];
      }
    });

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add update timestamp
    updates.updatedAt = new Date();

    // Update user
    const updatedUser = await UserRepository.update(userId, updates);

    return this.sanitizeUser(updatedUser);
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Find user with password included
    const user = await UserRepository.findById(userId, '+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Incorrect current password');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await UserRepository.update(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  async deleteUser(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Find homes owned by this user
    const homes = await HomeRepository.find({ ownerId: userId });

    // Delete each home and associated data
    for (const home of homes) {
      // Delete rooms in this home first
      await RoomService.deleteRoomsByHomeId(home._id);

      // Delete devices in this home
      await DeviceService.deleteDevicesByHomeId(home._id);

      // Delete device logs for this home
      await DeviceLogService.deleteLogsByHomeId(home._id);

      // Delete sensors in this home
      await SensorService.deleteSensorsByHomeId(home._id);

      // Delete sensor logs for this home
      await SensorLogService.deleteLogsByHomeId(home._id);

      // Delete automations for this home
      await AutomationService.deleteAutomationsByHomeId(home._id);

      // Delete home access entries for this home
      await HomeAccessService.deleteHomeAccessesByHomeId(home._id);

      // Delete all user-address relationships for the home's address
      if (home.addressId) {
        await UserAddressService.deleteUserAddressesByAddressId(home.addressId);

        // Delete address associated with this home
        await AddressService.deleteAddress(home.addressId);
      }

      // Delete the home itself
      await HomeRepository.delete(home._id);
    }

    // Delete all session data for this user
    await SessionRepository.deleteMany({ userId });

    // Delete home access entries for this user (for homes they don't own)
    await HomeAccessService.deleteHomeAccessesByUserId(userId);

    // Delete user-address relationships for this user
    await UserAddressService.deleteUserAddressesByUserId(userId);

    // Finally, permanently delete the user
    await UserRepository.delete(userId);
  }

  /**
   * Get all users in the system
   * @returns {Promise<Array>} - Array of sanitized user objects
   */
  async getAllUsers() {
    const users = await UserRepository.findAll();
    return users.map(user => this.sanitizeUser(user));
  }

  /**
   * Update a user's status
   * @param {string} userId - The user ID
   * @param {string} status - The new status ('active' or 'blocked')
   * @returns {Promise<Object>} - The updated user
   */
  async updateUserStatus(userId, status) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await UserRepository.update(userId, {
      status,
      updatedAt: new Date(),
    });

    return this.sanitizeUser(updatedUser);
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();
