const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  scannedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  scannedName: String,
  scannedRole: String,

  result: String, // VALID / INVALID / NOT ALLOWED

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VerificationLog', logSchema);