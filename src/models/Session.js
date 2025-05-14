import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
    deviceInfo: {
      browser: String,
      os: String,
      ip: String,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    },
    lastActivity: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index for faster token lookups
sessionSchema.index({ accessToken: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ userId: 1 });

const Session = mongoose.model('sessions', sessionSchema);

export default Session;
