const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({ 
  registerNo: {
    type: String,
    required: true
  },
  responses: {
    type: Object,
    of: String, 
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
