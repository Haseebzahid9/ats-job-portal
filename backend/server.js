const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const seedData = require('./utils/seed');

// Route imports
const authRoutes = require('./routes/auth_routes');
const jobRoutes = require('./routes/job_routes');
const applicationRoutes = require('./routes/application_routes');
const interviewRoutes = require('./routes/interview_routes');
const uploadRoutes = require('./routes/upload_routes');
const contactRoutes = require('./routes/contact_routes');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jobs Portal API is running.',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy.' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const keyValue = err.keyValue || {};
    const fields = Object.keys(keyValue);
    // Application duplicate: same user applied to same job
    if (fields.includes('job') && fields.includes('applicant')) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job.',
      });
    }
    // Email duplicate
    if (fields.includes('email')) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.',
      });
    }
    const field = fields[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. Please use a different value.`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(403).json({ success: false, message: 'Token has expired.' });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Custom multer file filter errors
  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({ success: false, message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API available at: http://localhost:${PORT}/api`);
  });
};

startServer();

module.exports = app;
