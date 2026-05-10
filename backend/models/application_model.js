const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    resume: {
      type: String,
      required: [true, 'Resume is required'],
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Rejected',
        'Selected',
      ],
      default: 'Submitted',
    },
    hrNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Unique compound index: one application per job per applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
