// src/server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler'); // add if you have it
// If you don't have an errorHandler file yet, see the sample below.

const app = express();

/**
 * Basic safety / environment config
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || ''; // set in render/vercel

/**
 * Connect to DB (handle any connection errors inside connectDB)
 */
connectDB();

/**
 * Middlewares - security / parsing / logging
 */
app.use(helmet()); // set secure HTTP headers

// Configure CORS - allow only your frontend(s) in production
if (NODE_ENV === 'production') {
  const allowed = (Array.isArray(process.env.ALLOWED_ORIGINS) && process.env.ALLOWED_ORIGINS.length)
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [FRONTEND_URL];

  app.use(cors({
    origin: function(origin, callback) {
      // allow requests with no origin (like curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowed.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  }));
} else {
  // development: allow all origins for convenience
  app.use(cors());
}

// parse json with a reasonable limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// request logging in dev
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * Rate limiting - especially protect authentication endpoints
 * We apply a general rate limiter and a stricter one for auth routes below.
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

/**
 * Static uploads folder
 * Serve files in src/uploads via /uploads/<filename>
 * NOTE: Ensure uploads folder exists and is in .gitignore
 */
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

/**
 * Routes - keep your existing route structure so frontend doesn't break.
 * If you later move to versioned API (e.g., /api/v1/...), update frontend accordingly.
 */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes')); // if you add uploads route

// Example: apply stricter rate-limit only to login route
// (Assumes authRoutes exports a router and the login route is POST /login)
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 8, // 8 login attempts per minute
  message: { success: false, message: 'Too many login attempts, try again later.' }
});
app.use('/api/auth/login', authRateLimiter); // this only affects /api/auth/login

/**
 * Health check (useful for Render/Vercel and uptime checks)
 */
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', node: NODE_ENV }));

/**
 * Root (you had this already)
 */
app.get('/', (req, res) => {
  res.send('API is running...');
});

/**
 * 404 handler for unknown routes
 */
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

/**
 * Central error handler - place after routes
 * If you don't yet have middleware/errorHandler.js, see the sample below.
 */
if (errorHandler) {
  app.use(errorHandler);
} else {
  // fallback simple handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err && err.stack ? err.stack : err);
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || 'Server Error' });
  });
}

/**
 * Graceful shutdown on SIGTERM / SIGINT
 */
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${NODE_ENV})`);
});

const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
