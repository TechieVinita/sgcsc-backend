// src/server.js
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const connectDB = require('./config/db');

// Optional custom error handler
let errorHandler = null;
try {
  errorHandler = require('./middleware/errorHandler');
} catch (e) {
  // optional custom handler – fallback defined below
}

/* --------------------------------------------------
 * Basic env / config
 * -------------------------------------------------- */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

/* --------------------------------------------------
 * Connect to DB
 * -------------------------------------------------- */
connectDB();

/* --------------------------------------------------
 * Create express app
 * -------------------------------------------------- */
const app = express();

/* --------------------------------------------------
 * Debug request logger (before everything else)
 * -------------------------------------------------- */
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

/* --------------------------------------------------
 * Core middlewares
 * -------------------------------------------------- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* --------------------------------------------------
 * CORS
 * -------------------------------------------------- */
// Allow your deployed frontends + local dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://sgcsc-site.vercel.app',
  'https://sgcsc-admin.vercel.app',
];

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools (Postman, curl) with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, log unexpected origins to debug CORS issues
      if (NODE_ENV === 'development') {
        console.warn(`CORS blocked origin: ${origin}`);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false, // you're using token auth, not cookies
  })
);

// IMPORTANT: do NOT use app.options('*', ...) on Express 5
// cors() already handles OPTIONS when mounted globally

/* --------------------------------------------------
 * Rate limiters
 * -------------------------------------------------- */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Stricter limiter for admin login
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: {
    success: false,
    message: 'Too many login attempts, try again later.',
  },
});

/* --------------------------------------------------
 * Static uploads folder
 * -------------------------------------------------- */
const uploadsPath = path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.warn('Created uploads folder at', uploadsPath);
  }
} catch (err) {
  console.error(
    'Could not ensure uploads folder:',
    err && err.message ? err.message : err
  );
}

app.use('/uploads', express.static(uploadsPath));

/* --------------------------------------------------
 * Import routers
 * -------------------------------------------------- */
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resultRoutes = require('./routes/resultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const affiliationsRoutes = require('./routes/affiliationsRoutes');

/* --------------------------------------------------
 * Mount routes
 * -------------------------------------------------- */

// Apply login rate limiter ONLY on admin login POST
// (route itself is defined inside authRoutes under /api/auth)
app.post('/api/auth/admin-login', authRateLimiter, (req, res, next) => {
  next();
});

// Auth
app.use('/api/auth', authRoutes);

// Core resources
app.use('/api/courses', courseRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/affiliations', affiliationsRoutes);

/* --------------------------------------------------
 * Health / root
 * -------------------------------------------------- */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    env: NODE_ENV,
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

/* --------------------------------------------------
 * 404 handler
 * -------------------------------------------------- */
app.use((req, res) => {
  if (NODE_ENV === 'development') {
    console.warn(`404 on ${req.method} ${req.originalUrl}`);
  }
  res.status(404).json({ success: false, message: 'Not Found' });
});

/* --------------------------------------------------
 * Error handler
 * -------------------------------------------------- */
if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err && err.stack ? err.stack : err);
    const status = err && err.status ? err.status : 500;
    res.status(status).json({
      success: false,
      message: (err && err.message) || 'Server Error',
    });
  });
}

/* --------------------------------------------------
 * Start server & graceful shutdown
 * -------------------------------------------------- */
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on ${SERVER_URL} (port ${PORT}) - NODE_ENV=${NODE_ENV}`
  );
  console.log(`Frontend URL (for reference): ${FRONTEND_URL || 'not set'}`);
  console.log('Mounted routes:');
  console.log('  /api/auth');
  console.log('  /api/courses');
  console.log('  /api/gallery');
  console.log('  /api/contact');
  console.log('  /api/students');
  console.log('  /api/results');
  console.log('  /api/uploads');
  console.log('  /api/affiliations');
});

const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Closed remaining connections, exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
