const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// 📘 Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// ➕ Add a new student
exports.addStudent = async (req, res) => {
  try {
    const { rollNo, name, email, password, dob, course, semester, contact, address } = req.body;

    // Basic validation
    if (!rollNo || !name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check if email or rollNo already exists
    const existing = await Student.findOne({ $or: [{ email }, { rollNo }] });
    if (existing) {
      return res.status(400).json({ message: 'Student with same email or roll number already exists' });
    }

    // Hash password before saving
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
    res.status(201).json(student);
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ message: 'Server error while adding student' });
  }
};

// ✏️ Update student details
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Failed to update student' });
  }
};

// 🗑️ Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};
