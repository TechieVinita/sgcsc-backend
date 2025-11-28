// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

let AdminUser = null;
try {
  // If the model exists, we'll use it to fetch the admin user
  AdminUser = require('../models/AdminUser');
} catch (e) {
  // If it doesn't exist, we fall back to payload-only behavior
  console.warn(
    '[authMiddleware] AdminUser model not found. Falling back to JWT payload only.'
  );
}

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.SECRET || 'change_this_secret_now';

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(req) {
  const authHeader =
    req.headers.authorization || req.headers.Authorization || '';

  if (typeof authHeader !== 'string') return null;
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return null;
  return parts[1].trim() || null;
}

/**
 * verifyAdmin middleware
 *
 * - Expects: Authorization: Bearer <token>
 * - Verifies JWT
 * - Optionally loads AdminUser from DB
 * - Attaches sanitized user data to req.user
 */
async function verifyAdmin(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ success: false, message: 'Token expired, please login again' });
      }
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token' });
    }

    // payload should typically have { id, role, ... }
    const userId = payload.id || payload._id || payload.userId || null;

    // If we have a model and an id, load from DB
    if (userId && AdminUser) {
      const admin = await AdminUser.findById(userId)
        .select('-password -__v')
        .lean();

      if (!admin) {
        return res
          .status(401)
          .json({ success: false, message: 'Admin user not found' });
      }

      req.user = admin;
    } else {
      // Fallback: just attach token payload
      req.user = payload;
    }

    // Optional: if you want to force "admin" role, uncomment this block:
    //
    // if (req.user.role && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    return next();
  } catch (err) {
    console.error(
      'authMiddleware.verifyAdmin error:',
      err && err.stack ? err.stack : err
    );
    return res
      .status(500)
      .json({ success: false, message: 'Authentication error' });
  }
}

/**
 * Role-based authorization
 * Usage: router.post('/x', verifyAdmin, verifyAdmin.authorizeRole('admin','superadmin'), handler)
 */
verifyAdmin.authorizeRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authenticated' });
  }

  const role = req.user.role;
  if (!role || !allowedRoles.includes(role)) {
    return res
      .status(403)
      .json({ success: false, message: 'Access denied' });
  }

  return next();
};

/**
 * Permission-based authorization
 * Usage: verifyAdmin.authorizePermission('results.create')
 */
verifyAdmin.authorizePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authenticated' });
  }

  // Superadmin bypasses permission checks
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

// CommonJS exports
module.exports = verifyAdmin;
module.exports.authorizeRole = verifyAdmin.authorizeRole;
module.exports.authorizePermission = verifyAdmin.authorizePermission;
