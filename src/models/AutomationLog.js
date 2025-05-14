import mongoose from 'mongoose';

const automationLogSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homes',
      required: true,
    },
    automationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'automations',
      required: true,
    },
    automationName: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: [
        'execution', // Виконання автоматизації
        'error',    // Помилка виконання
        'activation', // Активація автоматизації користувачем
        'deactivation', // Деактивація автоматизації користувачем
        'modification', // Зміна налаштувань автоматизації
        'creation', // Створення автоматизації
        'deletion' // Видалення автоматизації
      ],
      required: true,
    },
    // Інформація про тригер
    triggerType: {
      type: String,
      enum: ['time', 'sensor'],
      required: true,
    },
    // Дані тригера за часом
    timeData: {
      executionTime: String, // HH:MM
      dayOfWeek: String, // День тижня виконання
      isRecurring: Boolean, // Чи регулярне виконання
    },
    // Дані тригера за сенсором
    sensorData: {
      sensorId: mongoose.Schema.Types.ObjectId,
      sensorName: String, // Назва сенсора
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
          'weather_sensor'
        ]
      },
      propertyName: String, // Властивість, що спрацювала (e.g., 'currentTemperature')
      propertyValue: mongoose.Schema.Types.Mixed, // Значення властивості при спрацюванні
      triggerValue: mongoose.Schema.Types.Mixed, // Порогове значення з умови
      unit: String, // Одиниця виміру
      isDangerous: Boolean, // Чи є значення небезпечним
    },
    // Дані про дії з пристроями
    deviceActions: [{
      deviceId: mongoose.Schema.Types.ObjectId,
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
        ]
      },
      deviceName: String,
      roomId: mongoose.Schema.Types.ObjectId,
      roomName: String,
      // Результат дії
      actionType: String, // Тип дії (e.g., 'setPower', 'setTemperature')
      actionSettings: mongoose.Schema.Types.Mixed, // Налаштування, передані пристрою
      previousState: mongoose.Schema.Types.Mixed, // Попередній стан пристрою
      newState: mongoose.Schema.Types.Mixed, // Новий стан пристрою
      success: Boolean, // Успішність виконання
      errorMessage: String, // Повідомлення про помилку, якщо є
      executionTime: Number, // Час виконання в мілісекундах
    }],
    // Загальний статус виконання
    executionStatus: {
      type: String,
      enum: ['success', 'partial_success', 'failed'],
      required: true,
    },
    executionTime: Number, // Час виконання в мілісекундах
    errorMessage: String, // Загальне повідомлення про помилку
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    }, // Користувач, який ініціював дію (для активації/деактивації/модифікації)
    userName: String, // Ім'я користувача для відображення
    // Нові поля для розширеної аналітики
    
    details: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Створюємо індекси для швидкого пошуку
automationLogSchema.index({ automationId: 1, timestamp: -1 });
automationLogSchema.index({ homeId: 1, timestamp: -1 });
automationLogSchema.index({ timestamp: -1 });
automationLogSchema.index({ type: 1 });
automationLogSchema.index({ executionStatus: 1 });
automationLogSchema.index({ 'deviceActions.deviceId': 1 });
automationLogSchema.index({ 'sensorData.sensorId': 1 });
automationLogSchema.index({ userId: 1 });

const AutomationLog = mongoose.model('automation_logs', automationLogSchema);

export default AutomationLog; 