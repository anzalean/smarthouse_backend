import {
  RoleService,
  HomeService,
  UserService,
  HomeAccessService,
  UserAddressService,
} from '../services/index.js';

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await RoleService.getAllRoles();
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await RoleService.getRoleById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all user permissions for a specific home
export const getHomePermissions = async (req, res) => {
  try {
    const { homeId } = req.params;

    // Verify home exists
    const home = await HomeService.getHomeById(homeId, req.user.id);

    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    // Get home access records with populated user and role data
    const homePermissions =
      await HomeAccessService.getHomePermissionsWithDetails(homeId);

    return res.status(200).json(homePermissions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create new role
export const createRole = async (req, res) => {
  try {
    const roleData = req.body;
    const newRole = await RoleService.createRole(roleData);
    return res.status(201).json(newRole);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedRole = await RoleService.updateRole(id, updateData);
    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json(updatedRole);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRole = await RoleService.deleteRole(id);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Assign role to user for a specific home
export const assignRoleToUser = async (req, res) => {
  try {
    const { homeId, email, roleName, expiresAt } = req.body;
    const userId = req.user.id; // Current user (owner) ID from auth middleware

    // Check if current user is the owner of the home
    const home = await HomeService.getHomeById(homeId, userId);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    // Verify current user is the owner of the home
    const userAccess = await HomeAccessService.getHomeAccessByHomeAndUser(
      homeId,
      userId
    );
    if (!userAccess || userAccess.accessLevel !== 'full') {
      return res
        .status(403)
        .json({ message: 'Only the home owner can assign roles' });
    }

    // Find the user by email
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get role ID based on role name
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Skip admin role assignment through this endpoint
    if (role.name === 'admin') {
      return res.status(400).json({
        message: 'Admin role cannot be assigned through this endpoint',
      });
    }

    // Map role name to access level
    let accessLevel;
    switch (role.name) {
      case 'owner':
        accessLevel = 'full';
        break;
      case 'member':
        accessLevel = 'limited';
        break;
      case 'guest':
        accessLevel = 'guest';
        break;
      default:
        accessLevel = 'limited';
    }

    // Create or update home access
    const homeAccessData = {
      homeId,
      userId: user.id,
      roleId: role.id,
      grantedBy: userId,
      accessLevel,
      expiresAt: expiresAt || null,
    };

    // Check if access already exists and update or create
    const existingAccess = await HomeAccessService.getHomeAccessByHomeAndUser(
      homeId,
      user.id
    );
    let homeAccess;

    if (existingAccess) {
      homeAccess = await HomeAccessService.updateHomeAccess(
        existingAccess.id,
        homeAccessData
      );
    } else {
      homeAccess = await HomeAccessService.createHomeAccess(homeAccessData);
    }

    // Get address ID from home ID
    const address = await HomeService.getHomeAddress(homeId);
    if (!address) {
      return res.status(404).json({ message: 'Home address not found' });
    }

    // Create user address association if it doesn't exist
    const userAddressData = {
      userId: user.id,
      addressId: address.id,
      isPrimary: false,
      addressType: 'home',
    };

    // Check if user address already exists
    const existingUserAddress =
      await UserAddressService.getUserAddressByUserAndAddress(
        user.id,
        address.id
      );
    let userAddress;

    if (existingUserAddress) {
      userAddress = existingUserAddress;
    } else {
      userAddress = await UserAddressService.createUserAddress(userAddressData);
    }

    return res.status(200).json({
      message: 'Role assigned successfully',
      homeAccess,
      userAddress,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Remove role from user for a specific home
export const removeRoleFromUser = async (req, res) => {
  try {
    const { homeId, userId } = req.params;
    const currentUserId = req.user.id; // Current user (owner) ID from auth middleware

    // Check if current user is the owner of the home
    const userAccess = await HomeAccessService.getHomeAccessByHomeAndUser(
      homeId,
      currentUserId
    );
    if (!userAccess || userAccess.accessLevel !== 'full') {
      return res
        .status(403)
        .json({ message: 'Only the home owner can remove roles' });
    }

    // Find the home access to remove
    const accessToRemove = await HomeAccessService.getHomeAccessByHomeAndUser(
      homeId,
      userId
    );
    if (!accessToRemove) {
      return res.status(404).json({ message: 'Home access not found' });
    }

    // Don't allow removing the owner's access
    if (accessToRemove.accessLevel === 'full') {
      return res
        .status(403)
        .json({ message: "Cannot remove the owner's access" });
    }

    // Delete the home access
    await HomeAccessService.deleteHomeAccess(accessToRemove.id);

    return res.status(200).json({ message: 'Role removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
