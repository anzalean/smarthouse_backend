import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['owner', 'member', 'guest', 'admin'],
      unique: true,
      required: true,
    },
    description: String,
    permissions: [String],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Role = mongoose.model('roles', roleSchema);

export default Role;
