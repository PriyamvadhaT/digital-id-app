const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['admin', 'Admin', 'Student', 'Employee'],
      required: true
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // 🔐 force password change after first login
    isFirstLogin: {
      type: Boolean,
      default: true
    },

    // 🔗 link to Student / Employee document
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },

    profileModel: {
      type: String,
      enum: ['Student', 'Employee'],
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);