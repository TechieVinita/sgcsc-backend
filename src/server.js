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

/**
 * FRONTEND URL(s)
 * - You still have FRONTEND_URL / ALLOWED_ORIGINS in env, but we no longer
 *   use them for CORS blocking, to avoid preflight 500 errors on Render.
 */
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '';

/**
 * Public server base URL (used when returning upload file URLs)
 * e.g. https://sgcsc-backend.onrender.com
 */
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
   CORS config (simplified)
   -----------------------
   IMPORTANT: This is what fixes your Vercel login.
   - We let cors reflect the Origin instead of manually checking.
   - We explicitly respond to all OPTIONS preflight requests.
*/
app.use(
  cors({
    origin: true,       // reflect request origin
    credentials: true,  // safe even if you don't use cookies yet
  })
);

// Ensure all preflight requests succeed (no 500 on OPTIONS)
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
// (your route is POST /api/auth/admin-login)
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

// Route mounts
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

// central error handler (custom or fallback)
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
  console.log(`🚀 Server running on ${SERVER_URL} (port ${PORT}) - NODE_ENV=${NODE_ENV}`);
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
