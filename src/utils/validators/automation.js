import { body, param, query } from 'express-validator';

export const createAutomationValidator = [
  body('homeId').isMongoId().withMessage('Invalid home ID'),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString().trim(),
  body('isActive').optional().isBoolean(),
  body('triggerType')
    .isIn(['time', 'sensor'])
    .withMessage('Trigger type must be either time or sensor'),

  // Time trigger validation - ensure it exists when triggerType is 'time'
  body('timeTrigger')
    .if(body('triggerType').equals('time'))
    .notEmpty()
    .withMessage('Time trigger settings are required when trigger type is time')
    .bail()
    .isObject()
    .withMessage('Time trigger must be an object'),

  body('timeTrigger.startTime')
    .if(body('triggerType').equals('time'))
    .notEmpty()
    .withMessage('Start time is required')
    .bail()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('timeTrigger.endTime')
    .if(body('triggerType').equals('time'))
    .notEmpty()
    .withMessage('End time is required')
    .bail()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('timeTrigger.isRecurring')
    .if(body('triggerType').equals('time'))
    .optional()
    .isBoolean(),
  body('timeTrigger.daysOfWeek')
    .if(body('triggerType').equals('time'))
    .optional()
    .isArray()
    .custom(days => {
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      return days.every(day => validDays.includes(day.toLowerCase()));
    })
    .withMessage('Invalid days of week'),

  // Ensure sensorTrigger is not provided when triggerType is time
  body('sensorTrigger')
    .if(body('triggerType').equals('time'))
    .custom(value => {
      return value === undefined;
    })
    .withMessage(
      'Sensor trigger should not be provided when trigger type is time'
    ),

  // Sensor trigger validation - ensure it exists when triggerType is 'sensor'
  body('sensorTrigger')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage(
      'Sensor trigger settings are required when trigger type is sensor'
    )
    .bail()
    .isObject()
    .withMessage('Sensor trigger must be an object'),

  body('sensorTrigger.sensorId')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Sensor ID is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid sensor ID'),
  body('sensorTrigger.sensorType')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Sensor type is required')
    .bail()
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
      'weather_sensor',
    ])
    .withMessage('Invalid sensor type'),
  body('sensorTrigger.condition.property')
    .if(body('triggerType').equals('sensor'))
    .isString()
    .notEmpty()
    .withMessage('Condition property is required'),
  body('sensorTrigger.condition.triggerValue')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Trigger value is required'),
  body('sensorTrigger.condition.unit')
    .if(body('triggerType').equals('sensor'))
    .optional()
    .isString(),

  // Ensure timeTrigger is not provided when triggerType is sensor
  body('timeTrigger')
    .if(body('triggerType').equals('sensor'))
    .custom(value => {
      return value === undefined;
    })
    .withMessage(
      'Time trigger should not be provided when trigger type is sensor'
    ),

  // Device action validation
  body('deviceAction.deviceType')
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
  body('deviceAction.deviceIds')
    .isArray()
    .notEmpty()
    .withMessage('At least one device ID is required'),
  body('deviceAction.deviceIds.*').isMongoId().withMessage('Invalid device ID'),
  body('deviceAction.settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
    
  // Валідація специфічних полів налаштувань для кожного типу пристрою
  // Термостат
  body('deviceAction.settings.currentTemperature')
    .if(body('deviceAction.deviceType').equals('thermostat'))
    .optional()
    .isNumeric()
    .withMessage('Temperature must be a number'),
  body('deviceAction.settings.currentMode')
    .if(body('deviceAction.deviceType').equals('thermostat'))
    .optional()
    .isIn(['heat', 'cool', 'auto', 'eco'])
    .withMessage('Mode must be one of: heat, cool, auto, eco'),
    
  // Клапан опалення
  body('deviceAction.settings.currentTemperature')
    .if(body('deviceAction.deviceType').equals('heating_valve'))
    .optional()
    .isNumeric()
    .withMessage('Temperature must be a number'),
    
  // Розумний замок
  body('deviceAction.settings.currentDoorState')
    .if(body('deviceAction.deviceType').equals('smart_lock'))
    .optional()
    .isIn(['open', 'closed'])
    .withMessage('Door state must be one of: open, closed'),
    
  // Ворота
  body('deviceAction.settings.currentPosition')
    .if(body('deviceAction.deviceType').equals('gate'))
    .optional()
    .isIn(['open', 'closed'])
    .withMessage('Position must be one of: open, closed'),
    
  // Система поливу
  body('deviceAction.settings.currentWaterFlow')
    .if(body('deviceAction.deviceType').equals('irrigation_system'))
    .optional()
    .isNumeric()
    .withMessage('Water flow must be a number'),
  body('deviceAction.settings.duration')
    .if(body('deviceAction.deviceType').equals('irrigation_system'))
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),
    
  // Вентиляція
  body('deviceAction.settings.currentFanSpeed')
    .if(body('deviceAction.deviceType').equals('ventilation'))
    .optional()
    .isNumeric()
    .withMessage('Fan speed must be a number'),
  body('deviceAction.settings.currentMode')
    .if(body('deviceAction.deviceType').equals('ventilation'))
    .optional()
    .isIn(['auto', 'manual', 'boost', 'eco', 'night'])
    .withMessage('Mode must be one of: auto, manual, boost, eco, night'),
    
  // Очищувач повітря
  body('deviceAction.settings.currentFanSpeed')
    .if(body('deviceAction.deviceType').equals('air_purifier'))
    .optional()
    .isNumeric()
    .withMessage('Fan speed must be a number'),
  body('deviceAction.settings.currentMode')
    .if(body('deviceAction.deviceType').equals('air_purifier'))
    .optional()
    .isIn(['auto', 'manual', 'sleep', 'turbo', 'quiet'])
    .withMessage('Mode must be one of: auto, manual, sleep, turbo, quiet'),
    
  // Розумне світло
  body('deviceAction.settings.brightness')
    .if(body('deviceAction.deviceType').equals('smart_light'))
    .optional()
    .isNumeric()
    .withMessage('Brightness must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Brightness must be between 0 and 100'),
  body('deviceAction.settings.color')
    .if(body('deviceAction.deviceType').equals('smart_light'))
    .optional()
    .isIn([
      'white', 'warm_white', 'daylight', 'soft_white', 'cool_white',
      'candle', 'sunset', 'sunrise', 'deep_blue', 'ocean_blue', 
      'sky_blue', 'turquoise', 'mint', 'forest_green', 'lime', 
      'yellow', 'amber', 'orange', 'red', 'pink', 'fuchsia', 
      'purple', 'lavender', 'night_mode', 'reading_mode', 
      'movie_mode', 'party_mode', 'relax_mode', 'focus_mode'
    ])
    .withMessage('Invalid color'),
    
  // Камера
  body('deviceAction.settings.currentResolution')
    .if(body('deviceAction.deviceType').equals('camera'))
    .optional()
    .isObject()
    .withMessage('Resolution must be an object'),
  body('deviceAction.settings.currentResolution.width')
    .if(body('deviceAction.deviceType').equals('camera'))
    .optional()
    .isNumeric()
    .withMessage('Resolution width must be a number'),
  body('deviceAction.settings.currentResolution.height')
    .if(body('deviceAction.deviceType').equals('camera'))
    .optional()
    .isNumeric()
    .withMessage('Resolution height must be a number'),
];

export const updateAutomationValidator = [
  param('id').isMongoId().withMessage('Invalid automation ID'),
  body('triggerType')
    .optional()
    .isIn(['time', 'sensor'])
    .withMessage('Trigger type must be either time or sensor'),

  // Time trigger validation when updating - if triggerType is being changed to 'time'
  body('timeTrigger')
    .if(body('triggerType').equals('time'))
    .isObject()
    .withMessage('Time trigger must be an object'),

  body('timeTrigger.startTime')
    .if(body('triggerType').equals('time'))
    .notEmpty()
    .withMessage('Start time is required when trigger type is time')
    .bail()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('timeTrigger.endTime')
    .if(body('triggerType').equals('time'))
    .notEmpty()
    .withMessage('End time is required when trigger type is time')
    .bail()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('timeTrigger.isRecurring')
    .if(body('triggerType').equals('time'))
    .optional()
    .isBoolean(),
  body('timeTrigger.daysOfWeek')
    .if(body('triggerType').equals('time'))
    .optional()
    .isArray()
    .custom(days => {
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      return days.every(day => validDays.includes(day.toLowerCase()));
    })
    .withMessage('Invalid days of week'),

  // Ensure sensorTrigger is not provided when triggerType is time
  body('sensorTrigger')
    .if(body('triggerType').equals('time'))
    .custom(value => {
      return value === undefined;
    })
    .withMessage(
      'Sensor trigger should not be provided when trigger type is time'
    ),

  // Sensor trigger validation when updating - if triggerType is being changed to 'sensor'
  body('sensorTrigger')
    .if(body('triggerType').equals('sensor'))
    .isObject()
    .withMessage('Sensor trigger must be an object'),

  body('sensorTrigger.sensorId')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Sensor ID is required when trigger type is sensor')
    .bail()
    .isMongoId()
    .withMessage('Invalid sensor ID'),
  body('sensorTrigger.sensorType')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Sensor type is required when trigger type is sensor')
    .bail()
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
      'weather_sensor',
    ])
    .withMessage('Invalid sensor type'),
  body('sensorTrigger.condition.property')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Condition property is required when trigger type is sensor')
    .bail()
    .isString()
    .withMessage('Condition property must be a string'),
  body('sensorTrigger.condition.triggerValue')
    .if(body('triggerType').equals('sensor'))
    .notEmpty()
    .withMessage('Trigger value is required when trigger type is sensor'),
  body('sensorTrigger.condition.unit')
    .if(body('triggerType').equals('sensor'))
    .optional()
    .isString(),

  // Ensure timeTrigger is not provided when triggerType is sensor
  body('timeTrigger')
    .if(body('triggerType').equals('sensor'))
    .custom(value => {
      return value === undefined;
    })
    .withMessage(
      'Time trigger should not be provided when trigger type is sensor'
    ),

  // Device action validation
  body('deviceAction.deviceType')
    .optional()
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
  body('deviceAction.deviceIds')
    .optional()
    .isArray()
    .notEmpty()
    .withMessage('At least one device ID is required'),
  body('deviceAction.deviceIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid device ID'),
  body('deviceAction.settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
    
  // Валідація специфічних полів налаштувань для кожного типу пристрою
  // Термостат
  body('deviceAction.settings.currentTemperature')
    .if(body('deviceAction.deviceType').equals('thermostat'))
    .optional()
    .isNumeric()
    .withMessage('Temperature must be a number'),
  body('deviceAction.settings.currentMode')
    .if(body('deviceAction.deviceType').equals('thermostat'))
    .optional()
    .isIn(['heat', 'cool', 'auto', 'eco'])
    .withMessage('Mode must be one of: heat, cool, auto, eco'),
    
  // Клапан опалення
  body('deviceAction.settings.currentTemperature')
    .if(body('deviceAction.deviceType').equals('heating_valve'))
    .optional()
    .isNumeric()
    .withMessage('Temperature must be a number'),
    
  // Розумний замок
  body('deviceAction.settings.currentDoorState')
    .if(body('deviceAction.deviceType').equals('smart_lock'))
    .optional()
    .isIn(['open', 'closed'])
    .withMessage('Door state must be one of: open, closed'),
    
  // Ворота
  body('deviceAction.settings.currentPosition')
    .if(body('deviceAction.deviceType').equals('gate'))
    .optional()
    .isIn(['open', 'closed'])
    .withMessage('Position must be one of: open, closed'),
    
  // Система поливу
  body('deviceAction.settings.currentWaterFlow')
    .if(body('deviceAction.deviceType').equals('irrigation_system'))
    .optional()
    .isNumeric()
    .withMessage('Water flow must be a number'),
  body('deviceAction.settings.duration')
    .if(body('deviceAction.deviceType').equals('irrigation_system'))
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),
    
  // Вентиляція
  body('deviceAction.settings.currentFanSpeed')
    .if(body('deviceAction.deviceType').equals('ventilation'))
    .optional()
    .isNumeric()
    .withMessage('Fan speed must be a number'),
  body('deviceAction.settings.currentMode')
    .if(body('deviceAction.deviceType').equals('ventilation'))
    .optional()
    .isIn(['auto', 'manual', 'boost', 'eco', 'night'])
    .withMessage('Mode must be one of: auto, manual, boost, eco, night'),
    
  // Очищувач повітря
  body('deviceAction.settings.currentFanSpeed')
    .if(body('deviceAction.deviceType').equals('air_purifier'))
    .optional()
    .isNumeric()
    .withMessage('Fan speed must be a number'),
  body('deviceAction.settings.currentMode')
    .if(body('deviceAction.deviceType').equals('air_purifier'))
    .optional()
    .isIn(['auto', 'manual', 'sleep', 'turbo', 'quiet'])
    .withMessage('Mode must be one of: auto, manual, sleep, turbo, quiet'),
    
  // Розумне світло
  body('deviceAction.settings.brightness')
    .if(body('deviceAction.deviceType').equals('smart_light'))
    .optional()
    .isNumeric()
    .withMessage('Brightness must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Brightness must be between 0 and 100'),
  body('deviceAction.settings.color')
    .if(body('deviceAction.deviceType').equals('smart_light'))
    .optional()
    .isIn([
      'white', 'warm_white', 'daylight', 'soft_white', 'cool_white',
      'candle', 'sunset', 'sunrise', 'deep_blue', 'ocean_blue', 
      'sky_blue', 'turquoise', 'mint', 'forest_green', 'lime', 
      'yellow', 'amber', 'orange', 'red', 'pink', 'fuchsia', 
      'purple', 'lavender', 'night_mode', 'reading_mode', 
      'movie_mode', 'party_mode', 'relax_mode', 'focus_mode'
    ])
    .withMessage('Invalid color'),
    
  // Камера
  body('deviceAction.settings.currentResolution')
    .if(body('deviceAction.deviceType').equals('camera'))
    .optional()
    .isObject()
    .withMessage('Resolution must be an object'),
  body('deviceAction.settings.currentResolution.width')
    .if(body('deviceAction.deviceType').equals('camera'))
    .optional()
    .isNumeric()
    .withMessage('Resolution width must be a number'),
  body('deviceAction.settings.currentResolution.height')
    .if(body('deviceAction.deviceType').equals('camera'))
    .optional()
    .isNumeric()
    .withMessage('Resolution height must be a number'),
];

export const getAutomationsByHomeValidator = [
  query('homeId').isMongoId().withMessage('Invalid home ID'),
];

export const getAutomationsByTriggerTypeValidator = [
  query('homeId').isMongoId().withMessage('Invalid home ID'),
  param('type').isIn(['time', 'sensor']).withMessage('Invalid trigger type'),
];
