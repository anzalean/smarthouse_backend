import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is not required if googleId exists
        return !this.googleId;
      },
      minlength: 8,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    lastLogin: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false, // Don't return in normal queries
    },
    resetPasswordExpires: {
      type: Date,
      select: false, // Don't return in normal queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleProfile: {
      type: Object,
      select: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Find user with password included
  const user = await this.constructor.findById(this._id).select('+password');
  if (!user || !user.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, user.password);
};

// For backward compatibility with name field
userSchema.pre('save', function (next) {
  if (
    (this.isModified('firstName') || this.isModified('lastName')) &&
    (!this.name || this.name === '')
  ) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  next();
});

const User = mongoose.model('users', userSchema);

export default User;
