import mongoose from 'mongoose';

const homeUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    role: {
      type: String,
      enum: ['owner', 'member', 'guest', 'admin'],
      default: 'member',
    },
    accessLevel: {
      type: String,
      enum: ['full', 'limited', 'guest'],
      default: 'limited',
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const homeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'addresses',
      required: true,
    },
    type: {
      type: String,
      enum: ['house', 'apartment'],
      required: true,
    },
    configuration: {
      floors: Number,
      totalArea: Number,
      timezone: String,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
    users: [homeUserSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create indexes for faster lookups
homeSchema.index({ ownerId: 1 });
homeSchema.index({ addressId: 1 });
homeSchema.index({ 'users.userId': 1 });

const Home = mongoose.model('homes', homeSchema);

export default Home;
