const User = require('../models/user_model');

/**
 * @desc    Upload and update user profile picture in DB
 * @route   POST /api/upload/profile-picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const imageUrl = req.file.path; // Cloudinary URL

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      profilePicture: imageUrl,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload and update user resume and/or cover letter in DB
 * @route   POST /api/upload/document
 * @access  Private
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.files || (!req.files.resume && !req.files.coverLetter)) {
      return res.status(400).json({ success: false, message: 'No document file provided.' });
    }

    const updates = {};

    if (req.files.resume && req.files.resume[0]) {
      updates.resume = req.files.resume[0].path;
    }

    if (req.files.coverLetter && req.files.coverLetter[0]) {
      updates.coverLetter = req.files.coverLetter[0].path;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Document(s) uploaded successfully.',
      resume: user.resume,
      coverLetter: user.coverLetter,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadProfilePicture, uploadDocument };
