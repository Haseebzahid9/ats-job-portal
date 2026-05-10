const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: ['Islamabad', 'Lahore', 'Karachi', 'Remote'],
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      default: 1,
      min: 1,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    experience: {
      type: String,
      trim: true,
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    deadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: 'text', description: 'text' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
