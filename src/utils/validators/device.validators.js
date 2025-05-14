import { body } from 'express-validator';

// Base validation for common device fields
const baseDeviceValidation = [
  body('homeId')
    .notEmpty()
    .withMessage('Home ID is required')
    .isMongoId()
    .withMessage('Invalid home ID format'),

  body('name')
    .notEmpty()
    .withMessage('Device name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Device name must be 2-50 characters long'),

  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID format'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('lastUpdate')
    .optional()
    .isISO8601()
    .withMessage('Last update must be a valid date'),
];

// Валідація для полів розумної розетки
const smartPlugValidation = [
  body('currentLoad')
    .optional()
    .isNumeric()
    .withMessage('Current load must be a number'),
];

// Валідація для полів термостата
const thermostatValidation = [
  body('currentTemperature')
    .optional()
    .isNumeric()
    .withMessage('Current temperature must be a number'),
  
  body('currentMode')
    .optional()
    .isIn(['heat', 'cool', 'auto', 'eco'])
    .withMessage('Mode must be one of: heat, cool, auto, eco'),
];

// Валідація для полів нагрівального клапана
const heatingValveValidation = [
  body('currentTemperature')
    .optional()
    .isNumeric()
    .withMessage('Current temperature must be a number'),
];

// Валідація для полів розумного замка
const smartLockValidation = [
  body('currentDoorState')
    .optional()
    .isIn(['open', 'closed'])
    .withMessage('Current door state must be one of: open, closed'),
];

// Валідація для полів воріт
const gateValidation = [
  body('currentPosition')
    .optional()
    .isIn(['open', 'closed'])
    .withMessage('Current position must be one of: open, closed'),
];

// Валідація для полів зрошувальної системи
const irrigationSystemValidation = [
  body('currentWaterFlow')
    .optional()
    .isNumeric()
    .withMessage('Current water flow must be a number'),
];

// Валідація для полів вентиляції
const ventilationValidation = [
  body('currentMode')
    .optional()
    .isIn(['auto', 'manual', 'boost', 'eco', 'night'])
    .withMessage('Mode must be one of: auto, manual, boost, eco, night'),
  
  body('currentFanSpeed')
    .optional()
    .isNumeric()
    .withMessage('Current fan speed must be a number'),
  
  body('currentAirflow')
    .optional()
    .isNumeric()
    .withMessage('Current airflow must be a number'),
];

// Валідація для полів очищувача повітря
const airPurifierValidation = [
  body('currentMode')
    .optional()
    .isIn(['auto', 'manual', 'sleep', 'turbo', 'quiet'])
    .withMessage('Mode must be one of: auto, manual, sleep, turbo, quiet'),
  
  body('currentFanSpeed')
    .optional()
    .isNumeric()
    .withMessage('Current fan speed must be a number'),
  
  body('currentAirQuality')
    .optional()
    .isObject()
    .withMessage('Current air quality must be an object'),
  
  body('currentAirQuality.pm25')
    .optional()
    .isNumeric()
    .withMessage('PM2.5 must be a number'),
  
  body('currentAirQuality.pm10')
    .optional()
    .isNumeric()
    .withMessage('PM10 must be a number'),
];

// Валідація для полів камери
const cameraValidation = [
  body('currentResolution')
    .optional()
    .isObject()
    .withMessage('Current resolution must be an object'),
  
  body('currentResolution.width')
    .optional()
    .isNumeric()
    .withMessage('Width must be a number'),
  
  body('currentResolution.height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number'),
];

// Валідація для полів розумного освітлення
const smartLightValidation = [
  body('brightness')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Brightness must be between 0 and 100'),
  
  body('color')
    .optional()
    .isIn([
      'white', 
      'warm_white', 
      'daylight', 
      'soft_white',
      'cool_white',
      'candle', 
      'sunset', 
      'sunrise', 
      'deep_blue', 
      'ocean_blue',
      'sky_blue',
      'turquoise', 
      'mint', 
      'forest_green', 
      'lime', 
      'yellow', 
      'amber', 
      'orange', 
      'red', 
      'pink', 
      'fuchsia', 
      'purple', 
      'lavender',
      'night_mode',
      'reading_mode',
      'movie_mode',
      'party_mode',
      'relax_mode',
      'focus_mode',
    ])
    .withMessage('Invalid color value'),
];

export const createDeviceValidator = [
  ...baseDeviceValidation,
  body('deviceType')
    .notEmpty()
    .withMessage('Device type is required')
    .isIn([
      'smart_plug',
      'thermostat',
      'heating_valve',
      'smart_lock',
      'gate',
      'irrigation_system',
      'ventilation',
      'air_purifier',
      'camera',
      'smart_light',
    ])
    .withMessage('Invalid device type'),
  
  // Додаємо умовну валідацію в залежності від типу девайса
  body()
    .custom((value, { req }) => {
      // В залежності від типу девайса, проводимо додаткову валідацію
      switch (req.body.deviceType) {
        case 'smart_plug':
          for (const validator of smartPlugValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'thermostat':
          for (const validator of thermostatValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'heating_valve':
          for (const validator of heatingValveValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'smart_lock':
          for (const validator of smartLockValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'gate':
          for (const validator of gateValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'irrigation_system':
          for (const validator of irrigationSystemValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'ventilation':
          for (const validator of ventilationValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'air_purifier':
          for (const validator of airPurifierValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'camera':
          for (const validator of cameraValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'smart_light':
          for (const validator of smartLightValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
      }
      return true;
    })
    .withMessage('Invalid device type specific fields'),
];

export const updateDeviceValidator = [
  ...baseDeviceValidation.map(validator => {
    // Make all fields optional for updates
    if (
      validator.builder &&
      validator.builder.fields &&
      validator.builder.fields.length > 0
    ) {
      const field = validator.builder.fields[0];
      if (field === 'homeId') {
        // Don't allow homeId to be updated
        return body('homeId')
          .optional()
          .isEmpty()
          .withMessage('Home ID cannot be updated');
      }
    }
    return validator;
  }),

  body('deviceType')
    .optional()
    .isEmpty()
    .withMessage('Device type cannot be updated'),
  
  // Додаємо умовну валідацію для оновлення в залежності від типу девайса
  body()
    .custom((value, { req }) => {
      // Перевіряємо, що тип девайса не змінюється
      if (req.body.deviceType) return true;
      
      // Отримуємо тип девайса з існуючого запису в базі
      const deviceType = req.device?.deviceType;
      
      // В залежності від типу девайса, проводимо додаткову валідацію
      switch (deviceType) {
        case 'smart_plug':
          for (const validator of smartPlugValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'thermostat':
          for (const validator of thermostatValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'heating_valve':
          for (const validator of heatingValveValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'smart_lock':
          for (const validator of smartLockValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'gate':
          for (const validator of gateValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'irrigation_system':
          for (const validator of irrigationSystemValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'ventilation':
          for (const validator of ventilationValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'air_purifier':
          for (const validator of airPurifierValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'camera':
          for (const validator of cameraValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'smart_light':
          for (const validator of smartLightValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
      }
      return true;
    })
    .withMessage('Invalid device type specific fields'),
];
