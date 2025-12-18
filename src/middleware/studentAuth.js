const jwt = require("jsonwebtoken");

module.exports = function studentAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.studentId = decoded.studentId;
    next();
  } catch {
    return res.status(401).json({ success: false });
  }
};
