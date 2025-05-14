import { body } from 'express-validator';

export const createHomeValidator = [
  // Home data validation
  body('homeData.name')
    .trim()
    .notEmpty()
    .withMessage('Home name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Home name must be between 2 and 100 characters'),

  body('homeData.type')
    .notEmpty()
    .withMessage('Home type is required')
    .isIn(['house', 'apartment'])
    .withMessage('Home type must be either house or apartment'),

  body('homeData.floors')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Floors must be a positive integer'),

  body('homeData.totalArea')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Total area must be a positive number'),

  body('homeData.timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a valid string'),

  // Address data validation
  body('addressData.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('addressData.region')
    .trim()
    .notEmpty()
    .withMessage('Region is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Region must be between 2 and 100 characters'),

  body('addressData.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('addressData.street')
    .trim()
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Street must be between 2 and 100 characters'),

  body('addressData.buildingNumber')
    .trim()
    .notEmpty()
    .withMessage('Building number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Building number must be between 1 and 20 characters'),

  body('addressData.postalCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Postal code must be between 2 and 20 characters'),

  body('addressData.isApartment')
    .optional()
    .isBoolean()
    .withMessage('Is apartment must be a boolean'),

  body('addressData.apartmentNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Apartment number must not exceed 20 characters'),

  body('addressData.floor')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Floor must be a non-negative integer'),

  body('addressData.entrance')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Entrance must not exceed 20 characters'),

  body('addressData.additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional info must not exceed 500 characters'),
];

export const updateHomeValidator = [
  // Home data validation
  body('homeData.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Home name must be between 2 and 100 characters'),

  body('homeData.type')
    .optional()
    .isIn(['house', 'apartment'])
    .withMessage('Home type must be either house or apartment'),

  body('homeData.status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive'])
    .withMessage('Status must be active, maintenance, or inactive'),

  body('homeData.floors')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Floors must be a positive integer'),

  body('homeData.totalArea')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Total area must be a positive number'),

  body('homeData.timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a valid string'),

  // Address data validation
  body('addressData.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('addressData.region')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Region must be between 2 and 100 characters'),

  body('addressData.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('addressData.street')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Street must be between 2 and 100 characters'),

  body('addressData.buildingNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Building number must be between 1 and 20 characters'),

  body('addressData.postalCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Postal code must be between 2 and 20 characters'),

  body('addressData.isApartment')
    .optional()
    .isBoolean()
    .withMessage('Is apartment must be a boolean'),

  body('addressData.apartmentNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Apartment number must not exceed 20 characters'),

  body('addressData.floor')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Floor must be a non-negative integer'),

  body('addressData.entrance')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Entrance must not exceed 20 characters'),

  body('addressData.additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional info must not exceed 500 characters'),
];
