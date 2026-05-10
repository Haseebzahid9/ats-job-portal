const express = require('express');
const router = express.Router();
const { uploadProfilePicture, uploadDocument } = require('../controllers/upload_controller');
const { verifyToken } = require('../middleware/auth_middleware');
const {
  uploadProfile,
  uploadDocument: uploadDocumentMiddleware,
} = require('../middleware/upload_middleware');

// @route  POST /api/upload/profile-picture
router.post('/profile-picture', verifyToken, uploadProfile, uploadProfilePicture);

// @route  POST /api/upload/document
router.post('/document', verifyToken, uploadDocumentMiddleware, uploadDocument);

module.exports = router;
