import mongoose from 'mongoose';

// Схема автоматизації
const automationSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homes',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Тип тригера - за часом або за показником датчика
    triggerType: {
      type: String,
      enum: ['time', 'sensor'],
      required: true,
    },

    // Налаштування для тригера за часом
    timeTrigger: {
      startTime: {
        type: String, // формат "HH:MM"
        required: function () {
          return this.triggerType === 'time';
        },
      },
      endTime: {
        type: String, // формат "HH:MM"
        required: function () {
          return this.triggerType === 'time';
        },
      },
      isRecurring: {
        type: Boolean,
        default: false,
      },
      daysOfWeek: {
        type: [String], // 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
        validate: {
          validator: function (days) {
            if (!days || days.length === 0) return true;
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
          },
          message: 'Невірно вказані дні тижня',
        },
      },
    },

    // Налаштування для тригера за датчиком
    sensorTrigger: {
      sensorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor',
        required: function () {
          return this.triggerType === 'sensor';
        },
      },
      sensorType: {
        type: String,
        enum: [
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
        ],
        required: function () {
          return this.triggerType === 'sensor';
        },
      },
      // Умова спрацювання для датчика
      condition: {
        property: {
          type: String,
          required: function () {
            return this.triggerType === 'sensor';
          },
        },
        triggerValue: {
          type: mongoose.Schema.Types.Mixed,
          required: function () {
            return this.triggerType === 'sensor';
          },
        },
        unit: String,
      },
    },

    // Налаштування дій з пристроями
    deviceAction: {
      // Тип пристроїв для дії
      deviceType: {
        type: String,
        enum: [
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
        ],
        required: true,
      },
      // Список конкретних пристроїв
      deviceIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Device',
          required: true,
        },
      ],

      // Налаштування для пристроїв - спрощена структура без вкладеності за типами
      settings: {
        // Загальні поля
        isActive: Boolean,
        
        // Для термостата (thermostat)
        currentTemperature: Number, // Цільова температура
        currentMode: {
          type: String,
          enum: ['heat', 'cool', 'auto', 'eco', 'boost', 'manual', 'night', 'sleep', 'turbo', 'quiet'],
        },

        // Для розумного замка (smart_lock)
        currentDoorState: {
          type: String,
          enum: ['open', 'closed'],
        },

        // Для воріт (gate)
        currentPosition: {
          type: String,
          enum: ['open', 'closed'],
        },

        // Для системи поливу (irrigation_system)
        currentWaterFlow: Number,
        duration: Number, // тривалість поливу в хвилинах

        // Для вентиляції (ventilation)
        currentFanSpeed: Number,

        // Для розумного світла (smart_light)
        brightness: {
          type: Number,
          min: 0,
          max: 100,
        },
        color: {
          type: String,
          enum: [
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
          ],
        },

        // Для камери (camera)
        currentResolution: {
          width: Number,
          height: Number,
        },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Custom validator for the whole document
automationSchema.pre('validate', function (next) {
  // Check that only the appropriate trigger is provided based on triggerType
  if (this.triggerType === 'time') {
    // Time trigger is required and sensor trigger should not exist
    if (
      !this.timeTrigger ||
      !this.timeTrigger.startTime ||
      !this.timeTrigger.endTime
    ) {
      this.invalidate(
        'timeTrigger',
        'Time trigger with startTime and endTime is required when trigger type is time'
      );
    }

    // Clear sensorTrigger if it exists to prevent saving mixed data
    if (this.sensorTrigger) {
      this.sensorTrigger = undefined;
    }
  } else if (this.triggerType === 'sensor') {
    // Sensor trigger is required and time trigger should not exist
    if (
      !this.sensorTrigger ||
      !this.sensorTrigger.sensorId ||
      !this.sensorTrigger.sensorType ||
      !this.sensorTrigger.condition ||
      !this.sensorTrigger.condition.property ||
      this.sensorTrigger.condition.triggerValue === undefined
    ) {
      this.invalidate(
        'sensorTrigger',
        'Sensor trigger with sensorId, sensorType, and condition is required when trigger type is sensor'
      );
    }

    // Clear timeTrigger if it exists to prevent saving mixed data
    if (this.timeTrigger) {
      this.timeTrigger = undefined;
    }
  }

  // Ensure deviceAction has required fields
  if (
    !this.deviceAction ||
    !this.deviceAction.deviceType ||
    !this.deviceAction.deviceIds ||
    this.deviceAction.deviceIds.length === 0
  ) {
    this.invalidate(
      'deviceAction',
      'Device action with deviceType and deviceIds is required'
    );
  }

  next();
});

// Функція перевірки властивостей датчиків
automationSchema.path('sensorTrigger.condition.property').validate(function (
  value
) {
  if (this.triggerType !== 'sensor') return true;

  const sensorType = this.sensorTrigger.sensorType;

  // Допустимі тригерні властивості для кожного типу датчика (поточні значення)
  const validTriggerProperties = {
    temperature_sensor: ['currentTemperature'],
    humidity_sensor: ['currentHumidity'],
    motion_sensor: ['currentMotionIntensity'],
    smoke_sensor: ['currentSmokeLevel'],
    water_leak_sensor: ['currentWaterDetectionIndex'],
    gas_sensor: [
      'currentMethanLevel',
      'currentCarbonMonoxideLevel',
      'currentCarbonDioxideLevel',
      'currentPropaneLevel',
      'currentNitrogenDioxideLevel',
      'currentOzoneLevel',
    ],
    air_quality_sensor: ['currentAQI', 'currentPM25', 'currentPM10'],
    light_sensor: ['currentLux'],
    power_sensor: ['currentPower', 'currentVoltage', 'currentCurrent'],
    weather_sensor: [
      'currentTemperature',
      'currentHumidity',
      'currentPressure',
      'currentWindSpeed',
      'currentRainIntensity',
    ],
  };

  if (!validTriggerProperties[sensorType]) return true;

  return validTriggerProperties[sensorType].includes(value);
}, 'Невалідна тригерна властивість для обраного типу датчика');

// Перетворення на JSON - видалення полів, що не потрібні у відповіді
automationSchema.set('toJSON', {
  transform: function (doc, ret) {
    return ret;
  },
});

// Створення та експорт моделі
const Automation = mongoose.model('Automation', automationSchema);

export default Automation;
