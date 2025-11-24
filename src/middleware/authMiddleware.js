// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * verifyAdmin middleware: checks Authorization Bearer token, verifies JWT,
 * loads admin user and attaches `req.user` (without password).
 *
 * Export style: module.exports = verifyAdmin
 * Additionally we attach helper factories:
 *  - verifyAdmin.authorizeRole(...)
 *  - verifyAdmin.authorizePermission(...)
 *
 * This supports both:
 *  const verifyAdmin = require('../middleware/authMiddleware');
 *  router.post('/', verifyAdmin, ...)
 *
 * and also:
 *  const { authorizeRole } = require('../middleware/authMiddleware');
 */
async function verifyAdmin(req, res, next) {
  try {
    const auth = req.header('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // verify token (throws on invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const admin = await AdminUser.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // attach user object for downstream handlers
    req.user = admin;
    return next();
  } catch (err) {
    console.error('authMiddleware.verifyAdmin error:', err?.message || err);
    // distinguish token errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

/**
 * Role-based authorization factory
 * Usage: router.post('/x', verifyAdmin, verifyAdmin.authorizeRole('superadmin','admin'), handler)
 */
verifyAdmin.authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    return next();
  };
};

/**
 * Permission-based authorization factory
 * Example: verifyAdmin.authorizePermission('results.create')
 */
verifyAdmin.authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role === 'superadmin') return next();
    if (Array.isArray(req.user.permissions) && req.user.permissions.includes(permission)) return next();
    return res.status(403).json({ success: false, message: 'Permission denied' });
  };
};

// Also provide named exports for convenience (CommonJS)
module.exports = verifyAdmin;
module.exports.authorizeRole = verifyAdmin.authorizeRole;
module.exports.authorizePermission = verifyAdmin.authorizePermission;
