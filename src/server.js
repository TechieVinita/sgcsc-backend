// src/server.js
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
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
   CORS – make it *very* permissive
   ----------------------- */

const corsOptions = {
  origin: true,        // reflect Origin header
  credentials: true,   // allow Authorization header / cookies
};

// CORS MUST be first
app.use(cors(corsOptions));

// Explicitly handle all OPTIONS preflights
app.options('*', cors(corsOptions));

/* -----------------------
   Basic middlewares
   ----------------------- */

// Log every request – useful in Render logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: all rate limiters removed for now to avoid touching OPTIONS.
// Once everything works, you can re-add them carefully (skipping OPTIONS).

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
   Route mounting helper
   ----------------------- */
const mountIfExists = (mountPath, relativeRequirePath) => {
  try {
    const router = require(relativeRequirePath);
    app.use(mountPath, router);
    console.log(`Mounted ${mountPath} -> ${relativeRequirePath}`);
  } catch (err) {
    console.warn(`Router not mounted (missing or error): ${relativeRequirePath}`);
    console.warn(err && err.message ? err.message : err);
  }
};

/* -----------------------
   Routes
   ----------------------- */

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
