import { body } from 'express-validator';

export const createRoomValidator = [
  body('homeId')
    .notEmpty()
    .withMessage('homeId is required')
    .isMongoId()
    .withMessage('homeId must be a valid MongoDB ID'),
  body('name')
    .notEmpty()
    .withMessage('Room name is required')
    .isString()
    .withMessage('Room name must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Room name must be between 1 and 50 characters'),
  body('type')
    .optional()
    .isIn([
      'livingRoom',
      'bedroom',
      'kitchen',
      'bathroom',
      'hall',
      'office',
      'garage',
      'garden',
      'balcony',
      'terrace',
      'attic',
      'basement',
      'utility',
      'diningRoom',
      'playroom',
      'laundryRoom',
      'guestRoom',
      'pantry',
      'closet',
      'storageRoom',
      'gym',
      'library',
      'mediaRoom',
      'conservatory',
      'sunroom',
      'custom',
    ])
    .withMessage('Invalid room type'),
];

export const updateRoomValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Room name must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Room name must be between 1 and 50 characters'),
  body('type')
    .optional()
    .isIn([
      'livingRoom',
      'bedroom',
      'kitchen',
      'bathroom',
      'hall',
      'office',
      'garage',
      'garden',
      'balcony',
      'terrace',
      'attic',
      'basement',
      'utility',
      'diningRoom',
      'playroom',
      'laundryRoom',
      'guestRoom',
      'pantry',
      'closet',
      'storageRoom',
      'gym',
      'library',
      'mediaRoom',
      'conservatory',
      'sunroom',
      'custom',
    ])
    .withMessage('Invalid room type'),
];
