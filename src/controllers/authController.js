// server/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET";
const EXPIRES = "7d";

/* ================= ADMIN LOGIN ================= */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ⛔ IMPORTANT: explicitly include password
    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() })
      .select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: EXPIRES }
    );

    // Remove password before sending response
    const adminSafe = admin.toObject();
    delete adminSafe.password;

    return res.json({
      success: true,
      data: {
        token,
        user: adminSafe,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* ================= STUDENT LOGIN ================= */
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!student || !student.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const ok = await student.comparePassword(password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      JWT_SECRET,
      { expiresIn: EXPIRES }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: student.toJSON(),
      },
    });
  } catch (err) {
    console.error("studentLogin error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
