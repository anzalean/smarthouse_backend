import mongoose from 'mongoose';

const userAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'addresses',
      required: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create indexes for faster lookups
userAddressSchema.index({ userId: 1 });
userAddressSchema.index({ addressId: 1 });
userAddressSchema.index({ userId: 1, addressId: 1 }, { unique: true });

const UserAddress = mongoose.model('user_addresses', userAddressSchema);

export default UserAddress;
