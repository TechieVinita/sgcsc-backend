// server/src/controllers/authController.js
const Student = require('../models/Student');
const AdminUser = require('../models/AdminUser');
const PasswordResetToken = require('../models/PasswordResetToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

/**
 * Helper: sign JWT
 */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

/**
 * Helper: remove sensitive fields
 */
function sanitizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

// =======================
// Admin Login
// =======================
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ id: admin._id, role: 'admin' });
    const user = sanitizeUser(admin);

    return res.json({ success: true, data: { token, user } });
  } catch (err) {
    console.error('adminLogin error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// Student Login
// =======================
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ id: student._id, role: 'student' });
    const user = sanitizeUser(student);

    return res.json({ success: true, data: { token, user } });
  } catch (err) {
    console.error('studentLogin error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// Forgot Password
// =======================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const student = await Student.findOne({ email: email.toLowerCase() });
    // Always respond with success to avoid leaking whether email exists
    if (!student) {
      return res.json({ success: true, message: 'If your email exists, you will receive a reset link' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await PasswordResetToken.create({ student: student._id, token, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${student._id}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: student.email,
      subject: 'Password Reset',
      html: `
        <p>Hello ${student.name || ''},</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return res.json({ success: true, message: 'If your email exists, you will receive a reset link' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// Reset Password
// =======================
exports.resetPassword = async (req, res) => {
  try {
    const { token, id, newPassword } = req.body || {};
    if (!token || !id || !newPassword) return res.status(400).json({ success: false, message: 'Missing parameters' });

    const record = await PasswordResetToken.findOne({ token, student: id });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Token invalid or expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await Student.findByIdAndUpdate(id, { password: hashedPassword });

    await PasswordResetToken.deleteMany({ student: id });

    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
