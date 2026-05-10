const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  uploadResume,
} = require('../controllers/auth_controller');
const { verifyToken } = require('../middleware/auth_middleware');
const { uploadProfile, uploadResumeSingle } = require('../middleware/upload_middleware');

// Validation rules for registration
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('role')
    .optional()
    .isIn(['candidate', 'hr', 'admin'])
    .withMessage('Role must be candidate, hr, or admin.'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// @route  POST /api/auth/register
router.post('/register', registerValidation, register);

// @route  POST /api/auth/login
router.post('/login', loginValidation, login);

// @route  GET /api/auth/profile
router.get('/profile', verifyToken, getProfile);

// @route  PUT /api/auth/profile
router.put('/profile', verifyToken, updateProfile);

// @route  PUT /api/auth/change-password
router.put('/change-password', verifyToken, changePassword);

// @route  POST /api/auth/upload-picture
router.post('/upload-picture', verifyToken, uploadProfile, uploadProfilePicture);

// @route  PUT /api/auth/profile/resume
router.put('/profile/resume', verifyToken, uploadResumeSingle, uploadResume);

module.exports = router;
