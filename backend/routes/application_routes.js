const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getJobApplications,
  checkIfApplied,
} = require('../controllers/application_controller');
const { verifyToken } = require('../middleware/auth_middleware');
const { authorizeRoles } = require('../middleware/role_middleware');
const { uploadDocument } = require('../middleware/upload_middleware');

// NOTE: Specific paths must come before wildcard /:id paths

// @route  GET /api/applications/check/:jobId  — check if user already applied
router.get('/check/:jobId', verifyToken, authorizeRoles('candidate'), checkIfApplied);

// @route  GET /api/applications/my  — candidate's own applications
router.get('/my', verifyToken, authorizeRoles('candidate'), getMyApplications);

// @route  GET /api/applications/job/:jobId  — all applications for a job (HR/Admin)
router.get('/job/:jobId', verifyToken, authorizeRoles('hr', 'admin'), getJobApplications);

// @route  GET /api/applications  — all applications (HR/Admin)
router.get('/', verifyToken, authorizeRoles('hr', 'admin'), getAllApplications);

// @route  POST /api/applications  — candidate applies for a job
router.post('/', verifyToken, authorizeRoles('candidate'), uploadDocument, applyForJob);

// @route  GET /api/applications/:id  — single application
router.get('/:id', verifyToken, getApplicationById);

// @route  PUT /api/applications/:id/status  — update status (HR/Admin)
router.put('/:id/status', verifyToken, authorizeRoles('hr', 'admin'), updateApplicationStatus);

module.exports = router;