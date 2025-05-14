import * as authValidators from './auth.validators.js';
import * as userValidators from './user.validators.js';
import * as feedbackValidators from './feedback.validators.js';
import * as homeValidators from './homeValidator.js';
import * as deviceValidators from './device.validators.js';
import * as sensorValidators from './sensor.validators.js';
import * as googleAuthValidators from './googleAuthValidation.js';
import * as roleValidators from './role.validators.js';
import { createRoomValidator, updateRoomValidator } from './room.js';

export const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = authValidators;

export const {
  updateUserValidator,
  changePasswordValidator,
  updateUserStatusValidator,
} = userValidators;

export const { feedbackValidator } = feedbackValidators;

export const { createHomeValidator, updateHomeValidator } = homeValidators;

export const { createDeviceValidator, updateDeviceValidator } =
  deviceValidators;

export const { createSensorValidator, updateSensorValidator } =
  sensorValidators;

export const { googleLoginValidation } = googleAuthValidators;

export const {
  createRoleValidator,
  updateRoleValidator,
  assignRoleValidator,
  validateObjectId,
} = roleValidators;

export { createRoomValidator, updateRoomValidator };

export * from './automation.js';
