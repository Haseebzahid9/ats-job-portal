const { validationResult } = require('express-validator');
const User = require('../models/user_model');
const generateToken = require('../utils/generate_token');
const sendEmail = require('../utils/send_email');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phone, cnic, department, branch } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      phone,
      cnic,
      department,
      branch,
    });

    const token = generateToken(user._id.toString(), user.role);

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      cnic: user.cnic,
      department: user.department,
      branch: user.branch,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id.toString(), user.role);

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      cnic: user.cnic,
      department: user.department,
      branch: user.branch,
      profilePicture: user.profilePicture,
      resume: user.resume,
      coverLetter: user.coverLetter,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    // Send login notification email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: `New Login to Your Jobs Portal Account`,
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Jobs Portal</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Career Opportunities Platform</p>
            </div>
            <div style="padding:40px;background:#161b22;color:#e6edf3;">
              <h2 style="color:#fff;font-size:20px;margin:0 0 16px;">Welcome back, ${user.name}! 👋</h2>
              <p style="color:#8b949e;font-size:15px;line-height:1.6;margin:0 0 24px;">
                A successful login was detected on your account. If this was you, no action is needed.
              </p>
              <div style="background:#21262d;border:1px solid #30363d;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#8b949e;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Login Details</p>
                <p style="margin:4px 0;color:#e6edf3;font-size:14px;">📧 Email: <strong>${user.email}</strong></p>
                <p style="margin:4px 0;color:#e6edf3;font-size:14px;">🕐 Time: <strong>${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} PKT</strong></p>
                <p style="margin:4px 0;color:#e6edf3;font-size:14px;">👤 Role: <strong style="text-transform:capitalize;">${user.role}</strong></p>
              </div>
              <p style="color:#8b949e;font-size:13px;margin:0;">If you did not log in, please change your password immediately.</p>
            </div>
            <div style="padding:20px 40px;background:#0d1117;text-align:center;border-top:1px solid #21262d;">
              <p style="color:#484f58;font-size:12px;margin:0;">© 2026 Jobs Portal · Haseeb Zahid · haseebzahid4998@gmail.com</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Login email failed:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, cnic, department, branch } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, cnic, department, branch },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    // Accept both 'currentPassword' (frontend) and 'oldPassword' (legacy)
    const { currentPassword, oldPassword, newPassword } = req.body;
    const existingPassword = currentPassword || oldPassword;

    if (!existingPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(existingPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile picture via multer/cloudinary
 * @route   POST /api/auth/upload-picture
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

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated.',
      profilePicture: imageUrl,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload resume via multer/cloudinary
 * @route   PUT /api/auth/profile/resume
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file provided.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resume: req.file.path },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume: req.file.path,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  uploadResume,
};
