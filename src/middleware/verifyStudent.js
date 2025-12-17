const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const JWT_SECRET =
  process.env.JWT_SECRET || "CHANGE_THIS_SECRET_IN_ENV";

module.exports = async function verifyStudent(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    req.student = student.toJSON();
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
