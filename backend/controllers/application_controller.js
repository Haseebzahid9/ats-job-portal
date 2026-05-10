const mongoose = require('mongoose');
const Application = require('../models/application_model');
const Job = require('../models/job_model');
const User = require('../models/user_model');
const sendEmail = require('../utils/send_email');

/**
 * @desc    Check if the authenticated user has already applied for a job
 * @route   GET /api/applications/check/:jobId
 * @access  Private (Candidate)
 */
const checkIfApplied = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Valid Job ID is required.' });
    }

    const existing = await Application.findOne({
      job: new mongoose.Types.ObjectId(jobId),
      applicant: new mongoose.Types.ObjectId(req.user.id),
    });

    return res.status(200).json({
      success: true,
      applied: !!existing,
      application: existing || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply for a job (candidate only)
 * @route   POST /api/applications
 * @access  Private (Candidate)
 */
const applyForJob = async (req, res, next) => {
  try {
    // Accept both 'job' and 'jobId' field names from frontend
    const jobId = req.body.job || req.body.jobId;
    const coverLetterText = req.body.coverLetterText;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    // Verify job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active.' });
    }

    // Check if already applied
    // Use ObjectId for reliable duplicate check (avoids string vs ObjectId mismatch)
    const jobOid = new mongoose.Types.ObjectId(jobId);
    const applicantOid = new mongoose.Types.ObjectId(req.user.id);

    const existing = await Application.findOne({
      job: jobOid,
      applicant: applicantOid,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }

    // Get resume URL from uploaded file
    let resumeUrl = '';
    let coverLetterUrl = '';

    if (req.files) {
      if (req.files.resume && req.files.resume[0]) {
        resumeUrl = req.files.resume[0].path;
      }
      if (req.files.coverLetter && req.files.coverLetter[0]) {
        coverLetterUrl = req.files.coverLetter[0].path;
      }
    }

    // Fallback: check if user has a resume on profile
    if (!resumeUrl) {
      const user = await User.findById(req.user.id);
      if (user && user.resume) {
        resumeUrl = user.resume;
      } else {
        return res.status(400).json({ success: false, message: 'Resume is required.' });
      }
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      resume: resumeUrl,
      coverLetter: coverLetterUrl || coverLetterText || '',
    });

    // Send application confirmation email (non-blocking)
    try {
      const applicant = await User.findById(req.user.id).select('name email');
      if (applicant) {
        await sendEmail({
          to: applicant.email,
          subject: `Application Submitted – ${job.title}`,
          html: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Application Submitted! 🎉</h1>
                <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Jobs Portal · Career Opportunities</p>
              </div>
              <div style="padding:40px;background:#161b22;color:#e6edf3;">
                <h2 style="color:#fff;font-size:20px;margin:0 0 16px;">Hi ${applicant.name},</h2>
                <p style="color:#8b949e;font-size:15px;line-height:1.6;margin:0 0 24px;">
                  Your application has been successfully submitted. Our HR team will review your profile and get back to you.
                </p>
                <div style="background:#21262d;border:1px solid #30363d;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#8b949e;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Application Details</p>
                  <p style="margin:6px 0;color:#e6edf3;font-size:14px;">💼 Position: <strong>${job.title}</strong></p>
                  <p style="margin:6px 0;color:#e6edf3;font-size:14px;">🏢 Department: <strong>${job.department}</strong></p>
                  <p style="margin:6px 0;color:#e6edf3;font-size:14px;">📍 Location: <strong>${job.branch}</strong></p>
                  <p style="margin:6px 0;color:#e6edf3;font-size:14px;">📅 Applied: <strong>${new Date().toLocaleDateString('en-PK')}</strong></p>
                  <p style="margin:6px 0;color:#e6edf3;font-size:14px;">📊 Status: <strong style="color:#a78bfa;">Submitted</strong></p>
                </div>
                <p style="color:#8b949e;font-size:14px;line-height:1.6;margin:0;">
                  You can track your application status anytime by logging into your dashboard. We will notify you of any updates.
                </p>
              </div>
              <div style="padding:20px 40px;background:#0d1117;text-align:center;border-top:1px solid #21262d;">
                <p style="color:#484f58;font-size:12px;margin:0;">© 2026 Jobs Portal · Haseeb Zahid · 03184006367</p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Apply confirmation email failed:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }
    next(error);
  }
};

/**
 * @desc    Get all applications for the logged-in candidate
 * @route   GET /api/applications/my
 * @access  Private (Candidate)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        select: 'title department branch jobType deadline isActive postedBy',
        populate: { path: 'postedBy', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications (HR/Admin), optional filter by job or status
 * @route   GET /api/applications
 * @access  Private (HR/Admin)
 */
const getAllApplications = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    const filter = {};

    if (jobId) filter.job = jobId;
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('job', 'title department branch jobType')
      .populate('applicant', 'name email phone cnic profilePicture department branch')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title description department branch jobType experience salaryMin salaryMax requirements skills deadline postedBy')
      .populate('applicant', 'name email phone cnic profilePicture department branch resume');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Candidates can only view their own applications
    if (
      req.user.role === 'candidate' &&
      application.applicant._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (HR/Admin). Sends email notifications.
 * @route   PUT /api/applications/:id/status
 * @access  Private (HR/Admin)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, hrNotes } = req.body;

    const validStatuses = [
      'Submitted',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Rejected',
      'Selected',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title department branch')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    if (hrNotes !== undefined) application.hrNotes = hrNotes;
    await application.save();

    // Send email notification based on new status
    const candidateEmail = application.applicant.email;
    const candidateName = application.applicant.name;
    const jobTitle = application.job.title;
    const department = application.job.department;

    try {
      if (status === 'Shortlisted') {
        await sendEmail({
          to: candidateEmail,
          subject: `Shortlisted for ${jobTitle} – Jobs Portal`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c7be5;">Congratulations, ${candidateName}!</h2>
              <p>You have been <strong>shortlisted</strong> for the position of <strong>${jobTitle}</strong> at <strong>${department}</strong>.</p>
              <p>Our HR team will be in touch with further details regarding the next steps in the selection process.</p>
              <p>Thank you for your interest in joining our team.</p>
              <br/>
              <p>Best regards,<br/>HR Team – Jobs Portal</p>
            </div>
          `,
        });
      } else if (status === 'Interview Scheduled') {
        await sendEmail({
          to: candidateEmail,
          subject: `Interview Scheduled for ${jobTitle} – Jobs Portal`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c7be5;">Interview Scheduled</h2>
              <p>Dear ${candidateName},</p>
              <p>Your interview has been scheduled for the position of <strong>${jobTitle}</strong> at <strong>${department}</strong>.</p>
              <p>Please log in to the Jobs Portal to view the detailed interview schedule including date, time, venue, and mode.</p>
              <p>Please be on time and come prepared.</p>
              <br/>
              <p>Best regards,<br/>HR Team – Jobs Portal</p>
            </div>
          `,
        });
      } else if (status === 'Rejected') {
        await sendEmail({
          to: candidateEmail,
          subject: `Application Update for ${jobTitle} – Jobs Portal`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e63757;">Application Update</h2>
              <p>Dear ${candidateName},</p>
              <p>Thank you for applying for the position of <strong>${jobTitle}</strong> at <strong>${department}</strong>.</p>
              <p>We regret to inform you that after careful consideration, we will not be moving forward with your application at this time.</p>
              <p>We appreciate the time and effort you invested in the application process and encourage you to apply for future openings that match your profile.</p>
              <br/>
              <p>Best regards,<br/>HR Team – Jobs Portal</p>
            </div>
          `,
        });
      } else if (status === 'Selected') {
        await sendEmail({
          to: candidateEmail,
          subject: `Congratulations! Selected for ${jobTitle} – Jobs Portal`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #00d97e;">Congratulations, ${candidateName}!</h2>
              <p>We are delighted to inform you that you have been <strong>selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${department}</strong>.</p>
              <p>Our HR team will contact you shortly with onboarding details and further instructions.</p>
              <p>Welcome to the team!</p>
              <br/>
              <p>Best regards,<br/>HR Team – Jobs Portal</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
      // Don't fail the request if email fails
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to "${status}".`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for a specific job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (HR/Admin)
 */
const getJobApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { job: req.params.jobId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('applicant', 'name email phone cnic profilePicture department branch resume')
      .populate('job', 'title department branch jobType')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIfApplied,
  applyForJob,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getJobApplications,
};
