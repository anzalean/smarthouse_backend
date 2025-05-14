import mongoose from 'mongoose';

const homeAccessSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homes',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'roles',
      required: true,
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
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
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create indexes for faster lookups
homeAccessSchema.index({ homeId: 1 });
homeAccessSchema.index({ userId: 1 });
homeAccessSchema.index({ homeId: 1, userId: 1 }, { unique: true });

const HomeAccess = mongoose.model('home_access', homeAccessSchema);

export default HomeAccess;
