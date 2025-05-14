import BaseRepository from './BaseRepository.js';
import { Home } from '../models/index.js';
import HomeAccess from '../models/HomeAccess.js';

class HomeRepository extends BaseRepository {
  constructor() {
    super(Home);
  }

  async findByOwnerId(ownerId) {
    return this.find({ ownerId });
  }

  async findByAddressId(addressId) {
    return this.findOne({ addressId });
  }

  async findWithDetails(id) {
    return this.model.findById(id).populate('addressId').populate({
      path: 'users.userId',
      select: 'firstName lastName email',
    });
  }

  async findByUserIdWithDetails(userId) {
    return this.model
      .find({
        $or: [{ ownerId: userId }, { 'users.userId': userId }],
      })
      .populate('addressId');
  }

  /**
   * Find all homes that the user has access to (owned, member, or guest)
   * Each home will include a role field indicating the user's role in that home
   * @param {string} userId - The user ID to check access for
   * @returns {Promise<Array>} - Array of homes with role information
   */
  async findAllAccessibleHomes(userId) {
    // First get all homes owned by the user
    const ownedHomes = await this.find({ ownerId: userId });

    // Map owned homes to include role field
    const ownedHomesWithRole = ownedHomes.map(home => ({
      ...home.toObject(),
      role: 'owner',
      accessLevel: 'full',
    }));

    // Get all home accesses for the user
    const homeAccesses = await HomeAccess.find({
      userId: userId, // MongoDB will automatically convert string to ObjectId
      isActive: true,
    })
      .populate('roleId')
      .populate('homeId');

    // Filter out homes where user is not owner and add role information
    const accessibleHomes = homeAccesses
      .filter(
        access =>
          access.homeId && String(access.homeId.ownerId) !== String(userId)
      )
      .map(access => ({
        ...access.homeId.toObject(),
        role: access.roleId ? access.roleId.name : 'unknown',
        accessLevel: access.accessLevel,
      }));

    // Combine both lists and return
    return [...ownedHomesWithRole, ...accessibleHomes];
  }
}

export default new HomeRepository();
