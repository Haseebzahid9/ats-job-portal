const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviewByApplication,
  updateInterview,
  getAllInterviews,
} = require('../controllers/interview_controller');
const { verifyToken } = require('../middleware/auth_middleware');
const { authorizeRoles } = require('../middleware/role_middleware');

// NOTE: Specific paths before wildcard /:id

// @route  GET /api/interviews/application/:appId  — get interview by application
router.get('/application/:appId', verifyToken, getInterviewByApplication);

// @route  GET /api/interviews  — all interviews (HR/Admin)
router.get('/', verifyToken, authorizeRoles('hr', 'admin'), getAllInterviews);

// @route  POST /api/interviews  — schedule interview (HR/Admin)
router.post('/', verifyToken, authorizeRoles('hr', 'admin'), scheduleInterview);

// @route  PUT /api/interviews/:id  — update interview (HR/Admin)
router.put('/:id', verifyToken, authorizeRoles('hr', 'admin'), updateInterview);

module.exports = router;
