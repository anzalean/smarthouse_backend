import { RoleRepository } from '../repositories/index.js';

class RoleService {
  async getAllRoles() {
    return RoleRepository.findAll();
  }

  async getRoleById(roleId) {
    const role = await RoleRepository.findById(roleId);

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  async getRoleByName(name) {
    const role = await RoleRepository.findByName(name);

    if (!role) {
      throw new Error(`Role with name '${name}' not found`);
    }

    return role;
  }

  async createRole(roleData) {
    // Check if role with same name already exists
    const existingRole = await RoleRepository.findByName(roleData.name);
    if (existingRole) {
      throw new Error(`Role with name '${roleData.name}' already exists`);
    }

    return RoleRepository.create(roleData);
  }

  async updateRole(roleId, updateData) {
    const role = await RoleRepository.findById(roleId);

    if (!role) {
      throw new Error('Role not found');
    }

    // If updating name, check if the new name is already taken
    if (updateData.name && updateData.name !== role.name) {
      const existingRole = await RoleRepository.findByName(updateData.name);
      if (existingRole) {
        throw new Error(`Role with name '${updateData.name}' already exists`);
      }
    }

    return RoleRepository.update(roleId, updateData);
  }

  async deleteRole(roleId) {
    const role = await RoleRepository.findById(roleId);

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if it's a system role (owner, member, guest, admin)
    const systemRoles = ['owner', 'member', 'guest', 'admin'];
    if (systemRoles.includes(role.name)) {
      throw new Error(`Cannot delete system role '${role.name}'`);
    }

    return RoleRepository.delete(roleId);
  }

  // Initialize default roles if they don't exist
  async initializeDefaultRoles() {
    const defaultRoles = [
      {
        name: 'owner',
        description: 'Full access to home management and devices',
        permissions: [
          'manage_home',
          'manage_devices',
          'manage_rooms',
          'manage_users',
          'view_logs',
        ],
      },
      {
        name: 'member',
        description: 'Limited access to home devices and rooms',
        permissions: ['control_devices', 'view_rooms', 'view_logs'],
      },
      {
        name: 'guest',
        description: 'Guest access with limited device control',
        permissions: ['view_rooms', 'basic_device_control'],
      },
      {
        name: 'admin',
        description: 'System administrator with full access',
        permissions: ['manage_system', 'manage_users', 'manage_homes'],
      },
    ];

    for (const roleData of defaultRoles) {
      try {
        const existingRole = await RoleRepository.findByName(roleData.name);
        if (!existingRole) {
          await RoleRepository.create(roleData);
        }
      } catch (error) {
        console.error(`Error creating default role ${roleData.name}:`, error);
      }
    }
  }
}

export default new RoleService();
