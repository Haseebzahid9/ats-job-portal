const Job = require('../models/job_model');

/**
 * @desc    Get all active jobs with optional filters
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = async (req, res, next) => {
  try {
    const { branch, jobType, experience, search, salaryMin, salaryMax } = req.query;

    const filter = { isActive: true };

    if (branch) filter.branch = branch;
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experience = { $regex: experience, $options: 'i' };

    if (salaryMin || salaryMax) {
      filter.salaryMin = {};
      if (salaryMin) filter.salaryMin.$gte = Number(salaryMin);
      if (salaryMax) filter.salaryMax = { $lte: Number(salaryMax) };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email department')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email department');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    return res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Private (HR/Admin)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      department,
      branch,
      seats,
      jobType,
      experience,
      salaryMin,
      salaryMax,
      requirements,
      skills,
      deadline,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      department,
      branch,
      seats,
      jobType,
      experience,
      salaryMin,
      salaryMax,
      requirements,
      skills,
      deadline,
      postedBy: req.user.id,
    });

    return res.status(201).json({ success: true, message: 'Job created successfully.', job });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job
 * @route   PUT /api/jobs/:id
 * @access  Private (HR/Admin)
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email');

    return res.status(200).json({ success: true, message: 'Job updated successfully.', job: updatedJob });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete a job (set isActive = false)
 * @route   DELETE /api/jobs/:id
 * @access  Private (HR/Admin)
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    job.isActive = false;
    await job.save();

    return res.status(200).json({ success: true, message: 'Job deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get jobs posted by the currently logged-in HR/Admin
 * @route   GET /api/jobs/my/posted
 * @access  Private (HR/Admin)
 */
const getMyPostedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
};
