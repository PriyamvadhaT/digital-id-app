const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  id: String,
  department: String,
  email: String,
  mobile: String,

  role: { type: String, default: 'Employee' },
  photo: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);