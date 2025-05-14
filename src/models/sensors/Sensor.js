import mongoose from 'mongoose';
const { Schema } = mongoose;

const sensorSchema = new Schema(
  {
    homeId: { type: Schema.Types.ObjectId, ref: 'Home', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    name: { type: String, required: true },
    sensorType: { 
      type: String, 
      enum: [
        'temperature_sensor',
        'humidity_sensor',
        'motion_sensor',
        'smoke_sensor',
        'water_leak_sensor',
        'contact_sensor',
        'gas_sensor',
        'air_quality_sensor',
        'light_sensor',
        'power_sensor',
        'weather_sensor'
      ],
      required: true 
    },
    isActive: Boolean, // true - сенсор активний, false - неактивний
    lastUpdate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  {
    discriminatorKey: 'sensorType',
    collection: 'sensors',
  },
);

sensorSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Sensor = mongoose.model('Sensor', sensorSchema);
export default Sensor;