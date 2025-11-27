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

// optional error handler
let errorHandler = null;
try {
  errorHandler = require('./middleware/errorHandler');
} catch (e) {
  // ignore if not present
}

/* -----------------------
   Basic env / config
   ----------------------- */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
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

// NOTE: CORS MUST COME BEFORE ANY ROUTES.
// Super-permissive CORS: allow all origins, no custom origin() function.
app.use(
  cors({
    origin: true,        // reflect the incoming Origin header
    credentials: false,  // you are not using cookies; keep this false
  })
);
// Ensure all OPTIONS preflight requests succeed
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helmet AFTER CORS (and with relaxed cross-origin policy)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(compression());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* -----------------------
   Rate limiters
   ----------------------- */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Stricter limiter ONLY for the admin login endpoint
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many login attempts, try again later.' },
});
app.use('/api/auth/admin-login', authRateLimiter);

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
  console.error('Could not ensure uploads folder:', err?.message || err);
}
app.use('/uploads', express.static(uploadsPath));

/* -----------------------
   Routes
   ----------------------- */

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
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  // fallback error handler
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
