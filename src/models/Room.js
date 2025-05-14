import mongoose from 'mongoose';
const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    homeId: {
      type: Schema.Types.ObjectId,
      ref: 'Home',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'livingRoom',
        'bedroom',
        'kitchen',
        'bathroom',
        'hall',
        'office',
        'garage',
        'garden',
        'balcony',
        'terrace',
        'attic',
        'basement',
        'utility',
        'diningRoom',
        'playroom',
        'laundryRoom',
        'guestRoom',
        'pantry',
        'closet',
        'storageRoom',
        'gym',
        'library',
        'mediaRoom',
        'conservatory',
        'sunroom',
        'custom',
      ],
      default: 'custom',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create indexes for faster lookups
roomSchema.index({ homeId: 1 });

const Room = mongoose.model('rooms', roomSchema);

export default Room;
