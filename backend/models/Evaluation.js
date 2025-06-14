const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    unique: true
  },
  isReturningMember: Boolean,
  
  formFields: {
    personalDetails: {
    name: String,
    registerNo: String,
    mobile: String,
    program: String,
    school: String,
    gender: String,
    historyOfArrears: Boolean,
    nativeState: String
  },
    eventsCoordinated: [String],
    rolesAndResponsibilities: [String],
    suggestionsForEvents: String,
    suggestionsForCodeOfConduct: String,
    improvementArea: String,
    leadershipRoles: [{
      role: String,
      organization: String,
      contribution: String
    }],
    recommendedCommittee: [String], // For new applicants
  },
  skills: {
    communication: String,
    leadership: String,
    teamwork: String,
    problemSolving: String,
    impression: String
  },
  recommended: Boolean,
  reason: String,
  submittedBy: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Evaluation', evaluationSchema);
