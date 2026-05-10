const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    head: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
