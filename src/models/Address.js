import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: String,
    street: {
      type: String,
      required: true,
    },
    buildingNumber: {
      type: String,
      required: true,
    },
    isApartment: {
      type: Boolean,
      default: false,
    },
    apartmentNumber: String,
    floor: {
      type: Number,
      default: 1,
    },
    entrance: String,
    additionalInfo: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create composite index for address lookups
addressSchema.index({
  country: 1,
  region: 1,
  city: 1,
  street: 1,
  buildingNumber: 1,
});

const Address = mongoose.model('addresses', addressSchema);

export default Address;
