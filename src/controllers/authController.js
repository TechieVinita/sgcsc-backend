const Student = require('../models/Student');
const AdminUser = require('../models/AdminUser');
const PasswordResetToken = require('../models/PasswordResetToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// =======================
// Admin Login
// =======================
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await AdminUser.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =======================
// Student Login
// =======================
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET);
    res.json({ token, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =======================
// Forgot Password
// =======================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student)
      return res.status(200).json({ message: 'If your email exists, you will receive a reset link' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    await PasswordResetToken.create({ student: student._id, token, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${student._id}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: student.email,
      subject: 'Password Reset',
      html: `<p>Hello ${student.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link will expire in 1 hour.</p>`
    });

    res.json({ message: 'If your email exists, you will receive a reset link' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =======================
// Reset Password
// =======================
exports.resetPassword = async (req, res) => {
  try {
    const { token, id, newPassword } = req.body;
    const record = await PasswordResetToken.findOne({ token, student: id });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ message: 'Token invalid or expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await Student.findByIdAndUpdate(id, { password: hashedPassword });

    await PasswordResetToken.deleteMany({ student: id });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
