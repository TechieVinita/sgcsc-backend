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

let errorHandler = null;
try {
  errorHandler = require('./middleware/errorHandler'); // optional
} catch (e) {
  // no custom error handler present - we'll use fallback
}

/* -----------------------
   Basic env / config
   ----------------------- */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// We keep these for logging/reference only – NOT for CORS logic anymore
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

/* -----------------------
   Connect to DB
   ----------------------- */
connectDB();

/* -----------------------
   Create express app
   ----------------------- */
const app = express();

/* -----------------------
   Core middlewares
   ----------------------- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* -----------------------
   CORS CONFIG  (VERY SIMPLE)
   ----------------------- */
// OPEN CORS: allow all origins. This is what you need to make Vercel work.
// You are not using cookies, only Authorization header, so this is fine.
app.use(cors());

// Make sure preflight OPTIONS also gets CORS headers
app.options('*', cors());

/* -----------------------
   Rate limiters
   ----------------------- */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Stricter limiter for auth login endpoint
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many login attempts, try again later.' },
});

/* -----------------------
   Static uploads folder
   ----------------------- */
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

/* -----------------------
   Routes
   ----------------------- */

// Apply auth limiter to the actual admin login path
app.use('/api/auth/admin-login', authRateLimiter);

// Helper to mount routers if present (so server doesn't crash if a file is missing)
const mountIfExists = (mountPath, relativeRequirePath) => {
  try {
    const router = require(relativeRequirePath);
    app.use(mountPath, router);
    console.log(`Mounted ${mountPath} -> ${relativeRequirePath}`);
  } catch (err) {
    console.warn(`Router not mounted (missing or error): ${relativeRequirePath}`);
  }
};

mountIfExists('/api/auth', './routes/authRoutes');
mountIfExists('/api/courses', './routes/courseRoutes');
mountIfExists('/api/gallery', './routes/galleryRoutes');
mountIfExists('/api/contact', './routes/contactRoutes');
mountIfExists('/api/students', './routes/studentRoutes');
mountIfExists('/api/results', './routes/resultRoutes');
mountIfExists('/api/uploads', './routes/uploadRoutes');
mountIfExists('/api/affiliations', './routes/affiliationsRoutes');

/* -----------------------
   Health + root routes
   ----------------------- */
app.get('/health', (req, res) =>
  res.json({ success: true, status: 'ok', node: NODE_ENV })
);
app.get('/', (req, res) => res.send('API is running...'));

/* -----------------------
   404 and error handlers
   ----------------------- */
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  // fallback error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err && err.stack ? err.stack : err);
    const status = (err && err.status) || 500;
    res.status(status).json({
      success: false,
      message: (err && err.message) || 'Server Error',
    });
  });
}

/* -----------------------
   Start server & graceful shutdown
   ----------------------- */
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on ${SERVER_URL} (port ${PORT}) - NODE_ENV=${NODE_ENV}`
  );
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
