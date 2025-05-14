import { body, param } from 'express-validator';
import mongoose from 'mongoose';

export const validateObjectId = value => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

export const createRoleValidator = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isIn(['owner', 'member', 'guest', 'admin'])
    .withMessage(
      'Invalid role name. Must be one of: owner, member, guest, admin'
    ),
  body('description')
    .optional()
    .isString()
    .trim()
    .withMessage('Description must be a string'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
];

export const updateRoleValidator = [
  param('id').custom(validateObjectId).withMessage('Invalid role ID format'),
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Role name cannot be empty')
    .isIn(['owner', 'member', 'guest', 'admin'])
    .withMessage(
      'Invalid role name. Must be one of: owner, member, guest, admin'
    ),
  body('description')
    .optional()
    .isString()
    .trim()
    .withMessage('Description must be a string'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
];

export const assignRoleValidator = [
  body('homeId')
    .notEmpty()
    .withMessage('Home ID is required')
    .custom(validateObjectId)
    .withMessage('Invalid home ID format'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('roleName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isIn(['owner', 'member', 'guest'])
    .withMessage('Invalid role name. Must be one of: owner, member, guest'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date'),
];
