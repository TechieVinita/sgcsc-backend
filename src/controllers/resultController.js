// server/src/controllers/resultController.js
const Result = require('../models/Result');
const Student = require('../models/Student');

/**
 * Add a result for a student
 * Accepts JSON:
 * { studentId, course, semester, marks }
 */
exports.addResult = exports.AddResults = async (req, res) => {
  try {
    const { studentId, course, semester, marks } = req.body || {};

    // basic validation
    if (!studentId || !course || semester == null || marks == null) {
      return res.status(400).json({ success: false, message: 'studentId, course, semester and marks are required' });
    }

    // ensure numeric fields
    const semNum = Number(semester);
    const marksNum = Number(marks);
    if (Number.isNaN(semNum) || !Number.isFinite(semNum)) {
      return res.status(400).json({ success: false, message: 'semester must be a number' });
    }
    if (Number.isNaN(marksNum) || !Number.isFinite(marksNum)) {
      return res.status(400).json({ success: false, message: 'marks must be a number' });
    }
    if (marksNum < 0 || marksNum > 100) {
      return res.status(400).json({ success: false, message: 'marks must be between 0 and 100' });
    }

    // ensure student exists
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // create result
    const doc = new Result({
      studentId,
      course: String(course),
      semester: semNum,
      marks: marksNum,
      date: new Date()
    });

    await doc.save();

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('resultController.addResult error:', err);
    return res.status(500).json({ success: false, message: 'Server error while adding result' });
  }
};

/**
 * Get list of results (admin)
 */
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find().populate('studentId', 'name email rollNo').sort({ date: -1 });
    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('resultController.getResults error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching results' });
  }
};

/**
 * Optional: get single result by id
 */
exports.getResult = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid id' });
    const r = await Result.findById(id).populate('studentId', 'name email rollNo');
    if (!r) return res.status(404).json({ success: false, message: 'Result not found' });
    return res.json({ success: true, data: r });
  } catch (err) {
    console.error('resultController.getResult error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
