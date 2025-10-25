module.exports = function(allowedRoles = []) {
  return (req, res, next) => {
    // req.user should be set by your JWT protect middleware
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
