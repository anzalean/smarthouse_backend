import { body } from 'express-validator';

// Base validation for common sensor fields
const baseSensorValidation = [
  body('homeId')
    .notEmpty()
    .withMessage('Home ID is required')
    .isMongoId()
    .withMessage('Invalid home ID format'),

  body('name')
    .notEmpty()
    .withMessage('Sensor name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Sensor name must be 2-50 characters long'),

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

// Валідація для полів температурного сенсора
const temperatureSensorValidation = [
  body('currentTemperature')
    .optional()
    .isNumeric()
    .withMessage('Current temperature must be a number'),
  
  body('dangerousTemperaturePlus')
    .optional()
    .isNumeric()
    .withMessage('Dangerous temperature plus must be a number'),
  
  body('dangerousTemperatureMinus')
    .optional()
    .isNumeric()
    .withMessage('Dangerous temperature minus must be a number'),
];

// Валідація для полів сенсора вологості
const humiditySensorValidation = [
  body('currentHumidity')
    .optional()
    .isNumeric()
    .withMessage('Current humidity must be a number'),
  
  body('dangerousHumidity')
    .optional()
    .isNumeric()
    .withMessage('Dangerous humidity must be a number'),
];

// Валідація для полів датчика руху
const motionSensorValidation = [
  body('currentMotionIntensity')
    .optional()
    .isNumeric()
    .withMessage('Current motion intensity must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Current motion intensity must be between 0 and 100'),
  
  body('dangerousMotionIntensity')
    .optional()
    .isNumeric()
    .withMessage('Dangerous motion intensity must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Dangerous motion intensity must be between 0 and 100'),
];

// Валідація для полів датчика диму
const smokeSensorValidation = [
  body('currentSmokeLevel')
    .optional()
    .isNumeric()
    .withMessage('Current smoke level must be a number'),
  
  body('dangerousSmokeLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous smoke level must be a number'),
];

// Валідація для полів датчика протікання води
const waterLeakSensorValidation = [
  body('currentWaterDetectionIndex')
    .optional()
    .isNumeric()
    .withMessage('Current water detection index must be a number'),
  
  body('dangerousWaterDetectionIndex')
    .optional()
    .isNumeric()
    .withMessage('Dangerous water detection index must be a number'),
];

// Валідація для полів газового датчика
const gasSensorValidation = [
  body('currentMethanLevel')
    .optional()
    .isNumeric()
    .withMessage('Current methan level must be a number'),
  
  body('currentCarbonMonoxideLevel')
    .optional()
    .isNumeric()
    .withMessage('Current carbon monoxide level must be a number'),
  
  body('currentCarbonDioxideLevel')
    .optional()
    .isNumeric()
    .withMessage('Current carbon dioxide level must be a number'),
  
  body('currentPropaneLevel')
    .optional()
    .isNumeric()
    .withMessage('Current propane level must be a number'),
  
  body('currentNitrogenDioxideLevel')
    .optional()
    .isNumeric()
    .withMessage('Current nitrogen dioxide level must be a number'),
  
  body('currentOzoneLevel')
    .optional()
    .isNumeric()
    .withMessage('Current ozone level must be a number'),
  
  body('dangerousMethanLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous methan level must be a number'),
  
  body('dangerousCarbonMonoxideLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous carbon monoxide level must be a number'),
  
  body('dangerousCarbonDioxideLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous carbon dioxide level must be a number'),
  
  body('dangerousPropaneLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous propane level must be a number'),
  
  body('dangerousNitrogenDioxideLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous nitrogen dioxide level must be a number'),
  
  body('dangerousOzoneLevel')
    .optional()
    .isNumeric()
    .withMessage('Dangerous ozone level must be a number'),
];

// Валідація для полів датчика якості повітря
const airQualitySensorValidation = [
  body('currentAQI')
    .optional()
    .isNumeric()
    .withMessage('Current AQI must be a number'),
  
  body('currentPM25')
    .optional()
    .isNumeric()
    .withMessage('Current PM2.5 must be a number'),
  
  body('currentPM10')
    .optional()
    .isNumeric()
    .withMessage('Current PM10 must be a number'),
  
  body('dangerousAQI')
    .optional()
    .isNumeric()
    .withMessage('Dangerous AQI must be a number'),
  
  body('dangerousPM25')
    .optional()
    .isNumeric()
    .withMessage('Dangerous PM2.5 must be a number'),
  
  body('dangerousPM10')
    .optional()
    .isNumeric()
    .withMessage('Dangerous PM10 must be a number'),
];

// Валідація для полів датчика світла
const lightSensorValidation = [
  body('currentLux')
    .optional()
    .isNumeric()
    .withMessage('Current lux must be a number'),
  
  body('dangerousLux')
    .optional()
    .isNumeric()
    .withMessage('Dangerous lux must be a number'),
];

// Валідація для полів датчика потужності
const powerSensorValidation = [
  body('currentPower')
    .optional()
    .isNumeric()
    .withMessage('Current power must be a number'),
  
  body('currentVoltage')
    .optional()
    .isNumeric()
    .withMessage('Current voltage must be a number'),
  
  body('currentCurrent')
    .optional()
    .isNumeric()
    .withMessage('Current current must be a number'),
  
  body('dangerousPower')
    .optional()
    .isNumeric()
    .withMessage('Dangerous power must be a number'),
  
  body('dangerousVoltage')
    .optional()
    .isNumeric()
    .withMessage('Dangerous voltage must be a number'),
  
  body('dangerousCurrent')
    .optional()
    .isNumeric()
    .withMessage('Dangerous current must be a number'),
];

// Валідація для полів погодного датчика
const weatherSensorValidation = [
  body('currentTemperature')
    .optional()
    .isNumeric()
    .withMessage('Current temperature must be a number'),
  
  body('currentHumidity')
    .optional()
    .isNumeric()
    .withMessage('Current humidity must be a number'),
  
  body('currentPressure')
    .optional()
    .isNumeric()
    .withMessage('Current pressure must be a number'),
  
  body('currentWindSpeed')
    .optional()
    .isNumeric()
    .withMessage('Current wind speed must be a number'),
  
  body('currentRainIntensity')
    .optional()
    .isNumeric()
    .withMessage('Current rain intensity must be a number'),
  
  body('dangerousTemperature')
    .optional()
    .isNumeric()
    .withMessage('Dangerous temperature must be a number'),
  
  body('dangerousWindSpeed')
    .optional()
    .isNumeric()
    .withMessage('Dangerous wind speed must be a number'),
  
  body('dangerousRainIntensity')
    .optional()
    .isNumeric()
    .withMessage('Dangerous rain intensity must be a number'),
  
  body('dangerousTemperaturePlus')
    .optional()
    .isNumeric()
    .withMessage('Dangerous temperature plus must be a number'),
  
  body('dangerousTemperatureMinus')
    .optional()
    .isNumeric()
    .withMessage('Dangerous temperature minus must be a number'),
];

export const createSensorValidator = [
  ...baseSensorValidation,
  body('sensorType')
    .notEmpty()
    .withMessage('Sensor type is required')
    .isIn([
      'temperature_sensor',
      'humidity_sensor',
      'motion_sensor',
      'smoke_sensor',
      'water_leak_sensor',
      'gas_sensor',
      'air_quality_sensor',
      'light_sensor',
      'power_sensor',
      'weather_sensor'
    ])
    .withMessage('Invalid sensor type'),
  
  // Додаємо умовну валідацію в залежності від типу сенсора
  body()
    .custom((value, { req }) => {
      // В залежності від типу сенсора, проводимо додаткову валідацію
      switch (req.body.sensorType) {
        case 'temperature_sensor':
          // Валідація для кожного поля температурного сенсора
          for (const validator of temperatureSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'humidity_sensor':
          for (const validator of humiditySensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'motion_sensor':
          for (const validator of motionSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'smoke_sensor':
          for (const validator of smokeSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'water_leak_sensor':
          for (const validator of waterLeakSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'gas_sensor':
          for (const validator of gasSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'air_quality_sensor':
          for (const validator of airQualitySensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'light_sensor':
          for (const validator of lightSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'power_sensor':
          for (const validator of powerSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'weather_sensor':
          for (const validator of weatherSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
      }
      return true;
    })
    .withMessage('Invalid sensor type specific fields'),
];

export const updateSensorValidator = [
  ...baseSensorValidation.map(validator => {
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

  body('sensorType')
    .optional()
    .isEmpty()
    .withMessage('Sensor type cannot be updated'),
  
  // Додаємо умовну валідацію для оновлення в залежності від типу сенсора
  body()
    .custom((value, { req }) => {
      // Перевіряємо, що тип сенсора не змінюється
      if (req.body.sensorType) return true;
      
      // Отримуємо тип сенсора з існуючого запису в базі
      const sensorType = req.sensor?.sensorType;
      
      // В залежності від типу сенсора, проводимо додаткову валідацію
      switch (sensorType) {
        case 'temperature_sensor':
          for (const validator of temperatureSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'humidity_sensor':
          for (const validator of humiditySensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'motion_sensor':
          for (const validator of motionSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'smoke_sensor':
          for (const validator of smokeSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'water_leak_sensor':
          for (const validator of waterLeakSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'gas_sensor':
          for (const validator of gasSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'air_quality_sensor':
          for (const validator of airQualitySensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'light_sensor':
          for (const validator of lightSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'power_sensor':
          for (const validator of powerSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
        case 'weather_sensor':
          for (const validator of weatherSensorValidation) {
            const result = validator.run(req);
            if (result.errors) return false;
          }
          break;
      }
      return true;
    })
    .withMessage('Invalid sensor type specific fields'),
];
