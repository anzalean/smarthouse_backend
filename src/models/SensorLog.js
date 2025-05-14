import mongoose from 'mongoose';

const sensorLogSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homes',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'rooms',
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
      required: true,
    },
    sensorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sensors',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: [
        'measurement',
        'calibration',
        'maintenance',
        'error',
        'threshold_alert',
      ],
      required: true,
    },
    // Заміна простого value + unit на деталізовані поля для різних типів сенсорів
    // Дані температурного сенсора
    currentTemperature: Number,
    dangerousTemperaturePlus: Number,
    dangerousTemperatureMinus: Number,
    
    // Дані сенсора вологості
    currentHumidity: Number,
    dangerousHumidity: Number,
    
    // Дані сенсора руху
    currentMotionIntensity: Number,
    dangerousMotionIntensity: Number,
    
    // Дані сенсора диму
    currentSmokeLevel: Number,
    dangerousSmokeLevel: Number,
    
    // Дані сенсора протікання води
    currentWaterDetectionIndex: Number,
    dangerousWaterDetectionIndex: Number,
    
    // Дані газового сенсора
    currentMethanLevel: Number,
    currentCarbonMonoxideLevel: Number,
    currentCarbonDioxideLevel: Number,
    currentPropaneLevel: Number,
    currentNitrogenDioxideLevel: Number,
    currentOzoneLevel: Number,
    dangerousMethanLevel: Number,
    dangerousCarbonMonoxideLevel: Number,
    dangerousCarbonDioxideLevel: Number,
    dangerousPropaneLevel: Number,
    dangerousNitrogenDioxideLevel: Number,
    dangerousOzoneLevel: Number,
    
    // Дані сенсора якості повітря
    currentAQI: Number,
    currentPM25: Number,
    currentPM10: Number,
    dangerousAQI: Number,
    dangerousPM25: Number,
    dangerousPM10: Number,
    
    // Дані сенсора освітлення
    currentLux: Number,
    dangerousLux: Number,
    
    // Дані сенсора електроенергії
    currentPower: Number,
    currentVoltage: Number,
    currentCurrent: Number,
    dangerousPower: Number,
    dangerousVoltage: Number,
    dangerousCurrent: Number,
    
    // Дані метеостанції
    currentPressure: Number,
    currentWindSpeed: Number,
    currentRainIntensity: Number,
    dangerousWindSpeed: Number,
    dangerousRainIntensity: Number,
    
    // Загальні дані про вимірювання
    unit: String,
    
    details: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create indexes for faster lookups and time-series queries
sensorLogSchema.index({ sensorId: 1, timestamp: -1 });
sensorLogSchema.index({ homeId: 1, timestamp: -1 });
sensorLogSchema.index({ timestamp: -1 });
sensorLogSchema.index({ type: 1 });

const SensorLog = mongoose.model('sensor_logs', sensorLogSchema);

export default SensorLog;
