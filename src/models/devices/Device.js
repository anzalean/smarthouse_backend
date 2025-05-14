import mongoose from 'mongoose';
const { Schema } = mongoose;

const deviceSchema = new Schema(
  {
    homeId: { type: Schema.Types.ObjectId, ref: 'Home', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    name: { type: String, required: true },
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
      required: true
    },
    isActive: Boolean, // true - пристрій увімкнено, false - вимкнено
    lastUpdate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  {
    discriminatorKey: 'deviceType',
    collection: 'devices',
  },
);

deviceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Device = mongoose.model('Device', deviceSchema);
export default Device;