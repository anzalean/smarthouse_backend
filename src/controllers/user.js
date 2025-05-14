import { UserService } from '../services/index.js';

export const getCurrentUser = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (String(req.params.id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await UserService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.params.id !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    const statusCode = error.message.includes('No valid fields') ? 400 : 404;
    res.status(statusCode).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    if (req.params.id !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { currentPassword, newPassword } = req.body;

    await UserService.changePassword(
      req.params.id,
      currentPassword,
      newPassword
    );

    res.status(200).json({ message: 'Password successfully updated' });
  } catch (error) {
    console.error('Change password error:', error); // Different status codes based on the type of error
    if (error.message === 'Incorrect current password') {
      return res.status(401).json({ message: error.message });
    } else if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await UserService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User account successfully deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(404).json({ message: error.message });
  }
};

// Admin-only controller methods

/**
 * Get all users in the system (admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update a user's status (admin only)
 * Can set status to 'active' or 'blocked'
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Don't allow admins to block themselves
    if (id === req.user.id) {
      return res.status(400).json({
        message: 'You cannot change your own status',
      });
    }

    const updatedUser = await UserService.updateUserStatus(id, status);
    res.status(200).json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user status error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};
