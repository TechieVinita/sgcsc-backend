const Result = require('../models/Result');
const Student = require('../models/Student');

// Add a result
exports.AddResults = async (req, res) => {
  try {
    const { studentId, course, semester, marks } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const result = await Result.create({ studentId, course, semester, marks });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get results
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find().populate('studentId', 'name email');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
