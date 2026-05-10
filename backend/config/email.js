const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Email transporter error:', error.message);
  } else {
    console.log('Email transporter ready');
  }
});

module.exports = transporter;
