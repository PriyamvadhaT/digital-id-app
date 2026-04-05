const mongoose = require('mongoose');

const digitalIdSchema = new mongoose.Schema(
  {
    name: String,
    collegeId: String,

    role: {
      type: String,
      enum: ['Student', 'Employee']
    },

    department: String,
    batch: String, // only for students

    email: String,
    phone: String,

    isActive: {
      type: Boolean,
      default: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    photo: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('DigitalId', digitalIdSchema);