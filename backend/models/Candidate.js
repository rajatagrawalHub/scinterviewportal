const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  registerNo: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{2}[A-Z]{3}[0-9]{4}$/,
    length: 9
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  appliedForRole: {
    type: String,
    enum: ['Member Secretary', 'Executive Member'],
    required: true
  },
  rolePreferences: {
    type: [String],
    enum: [
      'Executive Member',
      'Member Secretary',
      'Member Secretary - Technical',
      'Member Secretary - Cultural'
    ],
    default: []
  },
  councilMemberLastYear: {
    type: Boolean,
    default: false
  },
  applicationStatus: {
    type: String,
    enum: [
      'Submitted',
      'Shortlisted',
      'Absent',
      'Recommended',
      'Not Recommended',
      "Pending"
    ],
    default: 'Submitted'
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
