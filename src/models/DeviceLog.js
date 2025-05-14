import mongoose from 'mongoose';

const deviceLogSchema = new mongoose.Schema(
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
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'devices',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: [
        'state_change',
        'command',
        'error',
        'maintenance',
        'power_change',
        'schedule_execution',
      ],
      required: true,
    },
    action: String,
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed,
    currentLoad: Number,
    currentMode: String,
    currentTemperature: Number,
    currentDoorState: String,
    currentPosition: String,
    currentWaterFlow: Number,
    currentVentilationMode: String,
    currentFanSpeed: Number,
    currentAirflow: Number,
    currentPurifierMode: String,
    currentPurifierFanSpeed: Number,
    currentPM25: Number,
    currentPM10: Number,
    currentResolutionWidth: Number,
    currentResolutionHeight: Number,
    currentBrightness: Number,
    currentColor: String,
    
    details: mongoose.Schema.Types.Mixed,
    success: Boolean,
    error: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create indexes for faster lookups and time-series queries
deviceLogSchema.index({ deviceId: 1, timestamp: -1 });
deviceLogSchema.index({ homeId: 1, timestamp: -1 });
deviceLogSchema.index({ timestamp: -1 });
deviceLogSchema.index({ type: 1 });
deviceLogSchema.index({ success: 1 });

const DeviceLog = mongoose.model('device_logs', deviceLogSchema);

export default DeviceLog;
