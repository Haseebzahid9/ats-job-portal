const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
} = require('../controllers/job_controller');
const { verifyToken } = require('../middleware/auth_middleware');
const { authorizeRoles } = require('../middleware/role_middleware');

// @route  GET /api/jobs/my/posted  — must come BEFORE /:id to avoid conflict
router.get('/my/posted', verifyToken, authorizeRoles('hr', 'admin'), getMyPostedJobs);

// @route  GET /api/jobs  — public
router.get('/', getAllJobs);

// @route  GET /api/jobs/:id  — public
router.get('/:id', getJobById);

// @route  POST /api/jobs  — HR/Admin only
router.post('/', verifyToken, authorizeRoles('hr', 'admin'), createJob);

// @route  PUT /api/jobs/:id  — HR/Admin only
router.put('/:id', verifyToken, authorizeRoles('hr', 'admin'), updateJob);

// @route  DELETE /api/jobs/:id  — HR/Admin only (soft delete)
router.delete('/:id', verifyToken, authorizeRoles('hr', 'admin'), deleteJob);

module.exports = router;
