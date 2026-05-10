const transporter = require('../config/email');

/**
 * Send an email via Gmail transporter.
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html    - HTML body content
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Jobs Portal" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
