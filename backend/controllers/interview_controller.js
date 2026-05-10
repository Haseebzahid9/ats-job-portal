const Interview = require('../models/interview_model');
const Application = require('../models/application_model');
const sendEmail = require('../utils/send_email');

/**
 * @desc    Schedule an interview for an application
 * @route   POST /api/interviews
 * @access  Private (HR/Admin)
 */
const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      scheduledDate,
      scheduledTime,
      venue,
      mode,
      notes,
      meetingLink,
    } = req.body;

    if (!applicationId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and scheduled date are required.',
      });
    }

    // Find the application and populate details for email
    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('job', 'title department branch');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Check if interview already exists for this application
    const existingInterview = await Interview.findOne({ application: applicationId });
    if (existingInterview) {
      return res.status(409).json({
        success: false,
        message: 'An interview is already scheduled for this application.',
      });
    }

    // Create interview record
    const interview = await Interview.create({
      application: applicationId,
      scheduledDate,
      scheduledTime,
      venue,
      mode: mode || 'In-person',
      notes,
      meetingLink,
    });

    // Update application status to 'Interview Scheduled'
    application.status = 'Interview Scheduled';
    await application.save();

    // Send email to candidate
    const candidateName = application.applicant.name;
    const candidateEmail = application.applicant.email;
    const jobTitle = application.job.title;
    const department = application.job.department;

    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-PK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    try {
      await sendEmail({
        to: candidateEmail,
        subject: `Interview Scheduled for ${jobTitle} – Jobs Portal`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c7be5;">Interview Scheduled</h2>
            <p>Dear ${candidateName},</p>
            <p>Your interview has been scheduled for the position of <strong>${jobTitle}</strong> at <strong>${department}</strong>.</p>
            <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background:#f0f4ff;">
                <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Date</td>
                <td style="padding:8px 12px; border:1px solid #ddd;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Time</td>
                <td style="padding:8px 12px; border:1px solid #ddd;">${scheduledTime || 'To be confirmed'}</td>
              </tr>
              <tr style="background:#f0f4ff;">
                <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Venue</td>
                <td style="padding:8px 12px; border:1px solid #ddd;">${venue || 'To be confirmed'}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Mode</td>
                <td style="padding:8px 12px; border:1px solid #ddd;">${mode || 'In-person'}</td>
              </tr>
              ${
                meetingLink
                  ? `<tr style="background:#f0f4ff;">
                       <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Meeting Link</td>
                       <td style="padding:8px 12px; border:1px solid #ddd;"><a href="${meetingLink}">${meetingLink}</a></td>
                     </tr>`
                  : ''
              }
              ${
                notes
                  ? `<tr>
                       <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Notes</td>
                       <td style="padding:8px 12px; border:1px solid #ddd;">${notes}</td>
                     </tr>`
                  : ''
              }
            </table>
            <p>Please be punctual and come prepared.</p>
            <p>If you have any questions, please reply to this email.</p>
            <br/>
            <p>Best regards,<br/>HR Team – Jobs Portal</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Interview email notification failed:', emailError.message);
    }

    const populatedInterview = await Interview.findById(interview._id).populate({
      path: 'application',
      populate: [
        { path: 'applicant', select: 'name email phone' },
        { path: 'job', select: 'title department branch' },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully. Candidate has been notified.',
      interview: populatedInterview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get interview by application ID
 * @route   GET /api/interviews/application/:appId
 * @access  Private
 */
const getInterviewByApplication = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ application: req.params.appId }).populate({
      path: 'application',
      populate: [
        { path: 'applicant', select: 'name email phone profilePicture' },
        { path: 'job', select: 'title department branch jobType' },
      ],
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    return res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an interview record
 * @route   PUT /api/interviews/:id
 * @access  Private (HR/Admin)
 */
const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'application',
      populate: [
        { path: 'applicant', select: 'name email phone' },
        { path: 'job', select: 'title department branch' },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Interview updated successfully.',
      interview: updatedInterview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all interviews (HR/Admin)
 * @route   GET /api/interviews
 * @access  Private (HR/Admin)
 */
const getAllInterviews = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const interviews = await Interview.find(filter)
      .populate({
        path: 'application',
        populate: [
          { path: 'applicant', select: 'name email phone profilePicture' },
          { path: 'job', select: 'title department branch jobType' },
        ],
      })
      .sort({ scheduledDate: 1 });

    return res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getInterviewByApplication,
  updateInterview,
  getAllInterviews,
};
