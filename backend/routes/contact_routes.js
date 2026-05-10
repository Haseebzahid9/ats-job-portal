const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/send_email');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    // Send to admin
    await sendEmail({
      to: 'haseebzahid4998@gmail.com',
      subject: `[Jobs Portal Contact] ${subject || 'New Message'} – from ${name}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 36px;">
            <h2 style="color:#fff;margin:0;font-size:20px;">New Contact Message</h2>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Jobs Portal – Contact Form</p>
          </div>
          <div style="padding:32px 36px;background:#161b22;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#8b949e;font-size:13px;width:100px;">From:</td><td style="padding:8px 0;color:#e6edf3;font-size:14px;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#8b949e;font-size:13px;">Email:</td><td style="padding:8px 0;color:#a78bfa;font-size:14px;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#8b949e;font-size:13px;">Subject:</td><td style="padding:8px 0;color:#e6edf3;font-size:14px;">${subject || 'General Inquiry'}</td></tr>
            </table>
            <div style="margin-top:20px;padding:20px;background:#21262d;border-radius:10px;border:1px solid #30363d;">
              <p style="color:#8b949e;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
              <p style="color:#e6edf3;font-size:14px;line-height:1.7;margin:0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div style="padding:16px 36px;background:#0d1117;text-align:center;border-top:1px solid #21262d;">
            <p style="color:#484f58;font-size:12px;margin:0;">Reply to: ${email}</p>
          </div>
        </div>
      `,
    });

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: `We received your message – Jobs Portal`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Message Received ✅</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Jobs Portal</p>
          </div>
          <div style="padding:36px 40px;background:#161b22;color:#e6edf3;">
            <h2 style="color:#fff;font-size:18px;margin:0 0 12px;">Hi ${name},</h2>
            <p style="color:#8b949e;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Thank you for reaching out! We've received your message and will get back to you within 24 hours.
            </p>
            <div style="background:#21262d;border:1px solid #30363d;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 6px;color:#8b949e;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Your message</p>
              <p style="margin:0;color:#e6edf3;font-size:13px;font-style:italic;">"${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"</p>
            </div>
            <p style="color:#8b949e;font-size:13px;margin:0;">For urgent matters: <a href="mailto:haseebzahid4998@gmail.com" style="color:#a78bfa;">haseebzahid4998@gmail.com</a> | 03184006367</p>
          </div>
          <div style="padding:16px 40px;background:#0d1117;text-align:center;border-top:1px solid #21262d;">
            <p style="color:#484f58;font-size:12px;margin:0;">© 2026 Jobs Portal · Haseeb Zahid</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
