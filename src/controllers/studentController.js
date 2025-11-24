// server/src/controllers/studentController.js
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: students });
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { rollNo, name, email, password, dob, course, semester, contact, address } = req.body;

    if (!rollNo || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const existing = await Student.findOne({ $or: [{ email }, { rollNo }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student with same email or roll number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      rollNo,
      name,
      email,
      password: hashedPassword,
      dob,
      course,
      semester,
      contact,
      address,
    });

    await student.save();
    return res.status(201).json({ success: true, data: student });
  } catch (err) {
    console.error('Error adding student:', err);
    return res.status(500).json({ success: false, message: 'Server error while adding student' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updatedStudent) return res.status(404).json({ success: false, message: 'Student not found' });

    return res.status(200).json({ success: true, data: updatedStudent });
  } catch (err) {
    console.error('Error updating student:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Student not found' });

    return res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
};
