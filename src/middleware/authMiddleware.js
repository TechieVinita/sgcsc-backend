// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

let AdminUser = null;
try {
  AdminUser = require('../models/AdminUser');
} catch {
  console.warn(
    '[authMiddleware] AdminUser model not found. Using JWT payload only.'
  );
}

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SECRET ||
  'CHANGE_THIS_SECRET_IN_ENV';

/* ======================================================
   Helpers
   ====================================================== */

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(req) {
  const header = req.headers.authorization || '';
  if (typeof header !== 'string') return null;

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer') return null;
  return token || null;
}

/* ======================================================
   Core Middleware
   ====================================================== */

async function verifyAdmin(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Authorization token missing' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === 'TokenExpiredError'
            ? 'Token expired. Please login again.'
            : 'Invalid token',
      });
    }

    const userId = payload.id || payload._id || payload.userId || null;

    // Load admin from DB if possible
    if (userId && AdminUser) {
      const admin = await AdminUser.findById(userId)
        .select('-password -__v')
        .lean();

      if (!admin) {
        return res
          .status(401)
          .json({ success: false, message: 'Admin account not found' });
      }

      req.user = admin;
    } else {
      // Fallback: attach JWT payload only
      req.user = payload;
    }

    return next();
  } catch (err) {
    console.error('[verifyAdmin] error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Authentication failed' });
  }
}

/* ======================================================
   Optional Add-ons
   ====================================================== */

/**
 * Role-based authorization
 * Usage:
 *   router.post('/x', verifyAdmin, verifyAdmin.authorizeRole('admin'))
 */
verifyAdmin.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' });
    }

    next();
  };
};

/**
 * Permission-based authorization
 * Usage:
 *   verifyAdmin.authorizePermission('subjects.create')
 */
verifyAdmin.authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });
    }

    if (req.user.role === 'superadmin') return next();

    if (
      Array.isArray(req.user.permissions) &&
      req.user.permissions.includes(permission)
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: 'Permission denied' });
  };
};

/* ======================================================
   EXPORT (IMPORTANT)
   ====================================================== */

module.exports = verifyAdmin;
