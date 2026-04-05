const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  course: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  parentMobile: { type: String, default: '' },
  photo: { type: String, default: '' },

  role: { type: String, default: 'Student' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);