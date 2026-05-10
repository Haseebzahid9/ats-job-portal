const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      unique: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['In-person', 'Online', 'Phone'],
      default: 'In-person',
    },
    notes: {
      type: String,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
