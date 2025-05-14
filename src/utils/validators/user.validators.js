import { body } from 'express-validator';

export const updateUserValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage(
      'First name must be 2-50 characters long and can only contain letters, spaces, and hyphens'
    ),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage(
      'Last name must be 2-50 characters long and can only contain letters, spaces, and hyphens'
    ),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8, max: 50 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'New password must be 8-50 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

export const updateUserStatusValidator = [
  body('status')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'blocked'])
    .withMessage('Status must be either "active" or "blocked"'),
];
