import { body } from 'express-validator';

export const googleLoginValidation = [
  body('token')
    .notEmpty()
    .withMessage('Google access token is required')
    .isString()
    .withMessage('Google access token must be a string'),
  body('userInfo')
    .notEmpty()
    .withMessage('Google user info is required')
    .isObject()
    .withMessage('Google user info must be an object'),
  body('userInfo.sub')
    .notEmpty()
    .withMessage('Google user ID is required')
    .isString()
    .withMessage('Google user ID must be a string'),
  body('userInfo.email')
    .notEmpty()
    .withMessage('Google user email is required')
    .isEmail()
    .withMessage('Invalid email format'),
];
