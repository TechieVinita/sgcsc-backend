// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const AdminUser = (() => {
  try {
    return require('../models/AdminUser');
  } catch (e) {
    // model might not exist in some setups — middleware will fallback to payload-only behavior
    return null;
  }
})();

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET || 'change_this_secret';

/**
 * verifyAdmin middleware
 * - Expects Authorization: Bearer <token>
 * - Verifies JWT, loads AdminUser (if model exists) and attaches req.user (without password)
 */
async function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // clear, specific responses for common JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // payload should contain id (your signToken signs { id: admin._id, role: 'admin' })
    const userId = payload.id || payload._id || payload.userId || null;

    if (userId && AdminUser) {
      const admin = await AdminUser.findById(userId).select('-password').lean();
      if (!admin) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = admin;
    } else {
      // Fallback: attach token payload (no DB lookup)
      // Useful for limited setups or when token contains full user info
      req.user = payload;
    }

    return next();
  } catch (err) {
    console.error('authMiddleware.verifyAdmin error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Role-based authorization factory
 * Usage: router.post('/x', verifyAdmin, verifyAdmin.authorizeRole('superadmin','admin'), handler)
 */
verifyAdmin.authorizeRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const role = req.user.role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  return next();
};

/**
 * Permission-based authorization factory
 * Example: verifyAdmin.authorizePermission('results.create')
 */
verifyAdmin.authorizePermission = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role === 'superadmin') return next();
  if (Array.isArray(req.user.permissions) && req.user.permissions.includes(permission)) return next();
  return res.status(403).json({ success: false, message: 'Permission denied' });
};

// CommonJS exports (works with require)
module.exports = verifyAdmin;
module.exports.authorizeRole = verifyAdmin.authorizeRole;
module.exports.authorizePermission = verifyAdmin.authorizePermission;
