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
  errorHandler = require('./middleware/errorHandler');
} catch (_) {}

/* --------------------------------------------------
 * Basic env / config
 * -------------------------------------------------- */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const FRONTEND_URL =
  process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

/* --------------------------------------------------
 * Connect DB
 * -------------------------------------------------- */
connectDB();

/* --------------------------------------------------
 * App
 * -------------------------------------------------- */
const app = express();

/* --------------------------------------------------
 * Request log
 * -------------------------------------------------- */
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

/* --------------------------------------------------
 * Core middleware
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
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      if (NODE_ENV === 'development') {
        console.warn(`CORS blocked origin: ${origin}`);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
  })
);

/* --------------------------------------------------
 * Rate limit
 * -------------------------------------------------- */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: {
    success: false,
    message: 'Too many login attempts, try again later.',
  },
});

/* --------------------------------------------------
 * Uploads paths
 * -------------------------------------------------- */
/**
 * We currently have TWO upload roots:
 *   1) server/uploads                  (legacy)
 *   2) server/src/uploads              (new)
 *        - and inside: uploads/assignments
 *
 * We do NOT want to break old code that already uses /uploads/...
 * So:
 *   - Frontend always hits /uploads/<fileNameFromDB>
 *   - Backend will try all candidate locations.
 */

const rootUploads = path.join(__dirname, '..', 'uploads'); // server/uploads
const srcUploads = path.join(__dirname, 'uploads');        // server/src/uploads
const assignmentsUploads = path.join(srcUploads, 'assignments');

function ensureDir(p) {
  try {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
      console.warn('Created folder:', p);
    }
  } catch (err) {
    console.error('Could not ensure folder', p, '-', err.message || err);
  }
}

ensureDir(rootUploads);
ensureDir(srcUploads);
ensureDir(assignmentsUploads);

// 1) Smart resolver for /uploads/<fileName>
app.get('/uploads/:file', (req, res, next) => {
  const safeName = path.basename(req.params.file); // prevent "../"
  const candidates = [
    path.join(rootUploads, safeName),
    path.join(srcUploads, safeName),
    path.join(assignmentsUploads, safeName),
  ];

  for (const fp of candidates) {
    if (fs.existsSync(fp)) {
      console.log('[UPLOAD HIT]', fp);
      return res.sendFile(fp);
    }
  }

  // let static middleware / 404 handler respond
  return next();
});

// 2) Static serving for any nested paths, e.g. /uploads/assignments/xxx
app.use('/uploads', express.static(rootUploads));
app.use('/uploads', express.static(srcUploads));

console.log('Serving uploads from:');
console.log(' -', rootUploads);
console.log(' -', srcUploads, '(and its subfolders like /assignments)');

/* --------------------------------------------------
 * Routes
 * -------------------------------------------------- */
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resultRoutes = require('./routes/resultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const affiliationsRoutes = require('./routes/affiliationsRoutes');
const franchiseRoutes = require('./routes/franchiseRoutes');

function safeRequireRoute(label, relativePath) {
  try {
    const mod = require(relativePath);
    console.log(`[ROUTE] Loaded ${label} from ${relativePath}`);
    return mod;
  } catch (e) {
    console.warn(
      `[WARN] ${label} route "${relativePath}" not found – /api/${label} will 404 until you create it.`
    );
    return null;
  }
}

const membersRoutes = safeRequireRoute('members', './routes/membersRoutes');
const admitCardRoutes = safeRequireRoute(
  'admit-cards',
  './routes/admitCardRoutes'
);
const certificateRoutes = safeRequireRoute(
  'certificates',
  './routes/certificateRoutes'
);
const studyMaterialRoutes = safeRequireRoute(
  'study-material',
  './routes/studyMaterialRoutes'
);
const assignmentRoutes = safeRequireRoute(
  'assignments',
  './routes/assignmentRoutes'
);

// login rate limiter only on admin login
app.post('/api/auth/admin-login', authRateLimiter, (req, res, next) => {
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/affiliations', affiliationsRoutes);
app.use('/api/franchises', franchiseRoutes);

if (membersRoutes) app.use('/api/members', membersRoutes);
if (admitCardRoutes) app.use('/api/admit-cards', admitCardRoutes);
if (certificateRoutes) app.use('/api/certificates', certificateRoutes);
if (studyMaterialRoutes) {
  app.use('/api/study-material', studyMaterialRoutes);
  app.use('/api/study-materials', studyMaterialRoutes);
}
if (assignmentRoutes) app.use('/api/assignments', assignmentRoutes);

/* --------------------------------------------------
 * Health / root
 * -------------------------------------------------- */
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', env: NODE_ENV });
});

app.get('/', (_req, res) => {
  res.send('API is running...');
});

/* --------------------------------------------------
 * 404
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
  app.use((err, _req, res, _next) => {
    console.error(err && err.stack ? err.stack : err);
    const status = err && err.status ? err.status : 500;
    res.status(status).json({
      success: false,
      message: (err && err.message) || 'Server Error',
    });
  });
}

/* --------------------------------------------------
 * Start
 * -------------------------------------------------- */
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on ${SERVER_URL} (port ${PORT}) - NODE_ENV=${NODE_ENV}`
  );
  console.log(`Frontend URL (for reference): ${FRONTEND_URL || 'not set'}`);
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
