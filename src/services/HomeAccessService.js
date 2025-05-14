import { HomeAccessRepository } from '../repositories/index.js';

class HomeAccessService {
  async getHomeAccessById(homeAccessId) {
    const homeAccess = await HomeAccessRepository.findById(homeAccessId);

    if (!homeAccess) {
      throw new Error('Home access not found');
    }

    return homeAccess;
  }

  async getHomeAccessesByHomeId(homeId) {
    return HomeAccessRepository.findByHomeId(homeId);
  }

  async getHomePermissionsWithDetails(homeId) {
    const homeAccesses = await HomeAccessRepository.model
      .find({ homeId, isActive: true })
      .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber',
        model: 'users',
      })
      .populate({
        path: 'roleId',
        select: 'name permissions',
        model: 'roles',
      });

    // Transform the data for a cleaner API response
    return homeAccesses.map(access => {
      const accessObj = access.toObject();
      return {
        ...accessObj,
        user: accessObj.userId,
        role: accessObj.roleId,
        userId: accessObj.userId._id,
        roleId: accessObj.roleId._id,
      };
    });
  }

  async getHomeAccessesByUserId(userId) {
    return HomeAccessRepository.findByUserId(userId);
  }

  async getHomeAccessByHomeAndUser(homeId, userId) {
    return HomeAccessRepository.findByHomeAndUser(homeId, userId);
  }

  async createHomeAccess(homeAccessData) {
    return HomeAccessRepository.create(homeAccessData);
  }

  async updateHomeAccess(homeAccessId, updateData) {
    const homeAccess = await HomeAccessRepository.findById(homeAccessId);

    if (!homeAccess) {
      throw new Error('Home access not found');
    }

    return HomeAccessRepository.update(homeAccessId, updateData);
  }

  async deleteHomeAccess(homeAccessId) {
    const homeAccess = await HomeAccessRepository.findById(homeAccessId);

    if (!homeAccess) {
      throw new Error('Home access not found');
    }

    return HomeAccessRepository.delete(homeAccessId);
  }

  async deleteHomeAccessesByHomeId(homeId) {
    return HomeAccessRepository.deleteMany({ homeId });
  }

  async deleteHomeAccessesByUserId(userId) {
    return HomeAccessRepository.deleteMany({ userId });
  }
}

export default new HomeAccessService();
