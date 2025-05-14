import { HomeRepository } from '../repositories/index.js';
import {
  DeviceService,
  SensorService,
  DeviceLogService,
  SensorLogService,
  AutomationService,
  UserAddressService,
  HomeAccessService,
  AddressService,
  RoomService,
} from './index.js';

class HomeService {
  async createHome(homeData, addressData, user) {
    // First, check if address already exists
    let address = await AddressService.getAddressByFields(addressData);

    // If address doesn't exist, create it
    if (!address) {
      address = await AddressService.createAddress(addressData);
    } else {
      // Check if a home already exists with this address
      const existingHome = await HomeRepository.findByAddressId(address._id);
      if (existingHome) {
        throw new Error('A home with this address already exists');
      }
    }

    // Get the owner role
    const { RoleRepository } = await import('../repositories/index.js');
    const ownerRole = await RoleRepository.findByName('owner');
    if (!ownerRole) {
      throw new Error('Owner role not found');
    }

    // Create a home with owner ID and address ID
    const homeToCreate = {
      name: homeData.name,
      ownerId: user.id,
      addressId: address._id,
      type: homeData.type,
      configuration: {
        floors: homeData.configuration.floors,
        totalArea: homeData.configuration.totalArea,
        timezone: homeData.configuration.timezone,
      },
      users: [
        {
          userId: user.id,
          role: 'owner',
          accessLevel: 'full',
        },
      ],
    };

    const home = await HomeRepository.create(homeToCreate);

    await UserAddressService.createUserAddress({
      userId: user.id,
      addressId: address._id,
      isPrimary: true,
      addressType: 'home',
    });

    await HomeAccessService.createHomeAccess({
      homeId: home._id,
      userId: user.id,
      roleId: ownerRole._id,
      grantedBy: user.id,
      accessLevel: 'full',
      grantedAt: new Date(),
      isActive: true,
    });

    return {
      home: await HomeRepository.findWithDetails(home._id),
      address,
    };
  }

  /**
   * Get the address associated with a home
   * @param {string} homeId - The ID of the home
   * @returns {Promise<Object|null>} - The address object or null if not found
   */
  async getHomeAddress(homeId) {
    try {
      // Get the home to retrieve the addressId
      const home = await HomeRepository.findById(homeId);

      if (!home || !home.addressId) {
        return null;
      }

      // Get the address using the addressId from the home
      const address = await AddressService.getAddressById(home.addressId);
      return address;
    } catch (error) {
      console.error(`Error fetching address for home ${homeId}:`, error);
      return null;
    }
  }

  async getHomesByUserId(userId) {
    // Get all homes where the user has access (owned, member, or guest)
    const accessibleHomes = await HomeRepository.findAllAccessibleHomes(userId);

    // If no homes are found, return an empty array
    if (!accessibleHomes || accessibleHomes.length === 0) {
      return [];
    }

    // For each home, populate the address if it's not already populated
    const homesWithAddress = await Promise.all(
      accessibleHomes.map(async home => {
        // Check if addressId exists and is not already populated (should be an ObjectId)
        if (
          home.addressId &&
          (!home.addressId.street || !home.addressId.city)
        ) {
          try {
            const address = await AddressService.getAddressById(home.addressId);
            return {
              ...home,
              addressId: address || home.addressId,
            };
          } catch (error) {
            console.error(
              `Error fetching address for home ${home._id}:`,
              error
            );
            return home;
          }
        }
        return home;
      })
    );

    return homesWithAddress;
  }

  async getHomeById(homeId, userId) {
    const home = await HomeRepository.findWithDetails(homeId);

    if (!home) {
      throw new Error('Home not found');
    }

    // Check if user is the owner
    const isOwner = String(home.ownerId) === String(userId);

    // If not owner, check for access through HomeAccess
    if (!isOwner) {
      const { HomeAccessService, RoleService } = await import('./index.js');
      const access = await HomeAccessService.getHomeAccessByHomeAndUser(
        homeId,
        userId
      );

      if (!access || !access.isActive) {
        throw new Error('Access denied');
      }

      // Get role information
      const role = await RoleService.getRoleById(access.roleId);

      // Add role information to the home object
      home.role = role.name;
      home.accessLevel = access.accessLevel;
    } else {
      // Add owner role information
      home.role = 'owner';
      home.accessLevel = 'full';
    }

    return home;
  }

  async updateHome(homeId, updateData, userId) {
    const home = await HomeRepository.findById(homeId);

    if (!home) {
      throw new Error('Home not found');
    }

    const isOwnerOrAdmin =
      String(home.ownerId) === String(userId) ||
      home.users.some(
        user =>
          String(user.userId) === String(userId) &&
          ['owner', 'admin'].includes(user.role)
      );

    if (!isOwnerOrAdmin) {
      throw new Error('Only home owners or admins can update home details');
    }

    // Fields that can be updated
    const allowedUpdates = ['name', 'status', 'configuration'];

    // Filter out invalid update fields
    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'configuration') {
          updates.configuration = {
            ...home.configuration,
            ...updateData.configuration,
          };
        } else {
          updates[key] = updateData[key];
        }
      }
    });

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updatedHome = await HomeRepository.update(homeId, updates);
    return HomeRepository.findWithDetails(updatedHome._id);
  }

  async updateHomeWithAddress(homeId, homeData, addressData, userId) {
    const home = await HomeRepository.findById(homeId);

    if (!home) {
      throw new Error('Home not found');
    }

    const isOwnerOrAdmin =
      String(home.ownerId) === String(userId) ||
      home.users.some(
        user =>
          String(user.userId) === String(userId) &&
          ['owner', 'admin'].includes(user.role)
      );

    if (!isOwnerOrAdmin) {
      throw new Error('Only home owners or admins can update home details');
    }

    // Check if both homeData and addressData are empty
    if (
      (!homeData || Object.keys(homeData).length === 0) &&
      (!addressData || Object.keys(addressData).length === 0)
    ) {
      throw new Error('No valid fields to update');
    }

    let updatedHome = home;
    let address = null;

    // Update home data if provided
    if (homeData && Object.keys(homeData).length > 0) {
      // Prepare the update object for home
      const homeUpdates = {
        name: homeData.name,
        type: homeData.type,
        status: homeData.status,
        configuration: {
          ...home.configuration,
          floors: homeData.configuration.floors,
          totalArea: homeData.configuration.totalArea,
          timezone: homeData.configuration.timezone,
        },
      };

      // Remove undefined properties
      Object.keys(homeUpdates).forEach(key => {
        if (homeUpdates[key] === undefined) {
          delete homeUpdates[key];
        }
      });

      if (homeUpdates.configuration) {
        Object.keys(homeUpdates.configuration).forEach(key => {
          if (homeUpdates.configuration[key] === undefined) {
            delete homeUpdates.configuration[key];
          }
        });
      }

      updatedHome = await HomeRepository.update(homeId, homeUpdates);
    }

    // Update address data if provided
    if (addressData && Object.keys(addressData).length > 0) {
      // Get the current address
      address = await AddressService.getAddressById(home.addressId);

      // Update the address
      address = await AddressService.updateAddress(address._id, addressData);
    } else {
      // If no address data provided, get the current address for the response
      address = await AddressService.getAddressById(home.addressId);
    }

    return {
      home: await HomeRepository.findWithDetails(updatedHome._id),
      address,
    };
  }

  async deleteHome(homeId, userId) {
    const home = await HomeRepository.findById(homeId);

    if (!home) {
      throw new Error('Home not found');
    }

    // Only the owner can delete the home
    if (String(home.ownerId) !== String(userId)) {
      throw new Error('Only home owners can delete homes');
    }

    // Get the address ID before deleting the home
    const addressId = home.addressId;

    // Delete rooms in this home first
    await RoomService.deleteRoomsByHomeId(homeId);

    // Delete devices in this home
    await DeviceService.deleteDevicesByHomeId(homeId);

    // Delete device logs for this home
    await DeviceLogService.deleteLogsByHomeId(homeId);

    // Delete sensors in this home
    await SensorService.deleteSensorsByHomeId(homeId);

    // Delete sensor logs for this home
    await SensorLogService.deleteLogsByHomeId(homeId);

    // Delete automations for this home
    await AutomationService.deleteAutomationsByHomeId(homeId);

    // Delete all home access records for this home
    await HomeAccessService.deleteHomeAccessesByHomeId(homeId);

    // Delete the home itself
    await HomeRepository.delete(homeId);

    // Delete all user-address relationships for this address
    await UserAddressService.deleteUserAddressesByAddressId(addressId);

    // Also delete the address
    if (addressId) {
      await AddressService.deleteAddress(addressId);
    }

    return { message: 'Home and all associated data successfully deleted' };
  }
}

export default new HomeService();
