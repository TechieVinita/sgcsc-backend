// server/src/controllers/subjectController.js
const Subject = require('../models/Subject');
const Course = require('../models/Course');

// POST /api/subjects  (Admin) – create subject
exports.createSubject = async (req, res, next) => {
  try {
    const { course, name, maxMarks, minMarks, isActive } = req.body;

    if (!course) {
      return res
        .status(400)
        .json({ success: false, message: 'Course is required' });
    }

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Subject name is required' });
    }

    // Ensure referenced course exists (avoid orphan subjects)
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid course ID' });
    }

    const subject = await Subject.create({
      course,
      name: name.trim(),
      maxMarks: maxMarks != null ? Number(maxMarks) : 0,
      minMarks: minMarks != null ? Number(minMarks) : 0,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    return res.status(201).json({ success: true, data: subject });
  } catch (err) {
    console.error('createSubject error:', err);
    return next(err);
  }
};

// GET /api/subjects  (Admin) – list subjects (optional ?course=... filter)
exports.getSubjects = async (req, res, next) => {
  try {
    const { course } = req.query;
    const filter = {};

    if (course) {
      filter.course = course;
    }

    const subjects = await Subject.find(filter)
      .populate('course', 'name title duration')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: subjects });
  } catch (err) {
    console.error('getSubjects error:', err);
    return next(err);
  }
};

// GET /api/subjects/:id  (Admin) – single subject
exports.getSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).populate(
      'course',
      'name title duration'
    );

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    }

    return res.json({ success: true, data: subject });
  } catch (err) {
    console.error('getSubject error:', err);
    return next(err);
  }
};

// PUT /api/subjects/:id  (Admin) – update subject
exports.updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { course, name, maxMarks, minMarks, isActive } = req.body;

    const update = {};

    if (course !== undefined) {
      // validate the course if changed
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid course ID' });
      }
      update.course = course;
    }

    if (name !== undefined) update.name = name.trim();
    if (maxMarks !== undefined) update.maxMarks = Number(maxMarks);
    if (minMarks !== undefined) update.minMarks = Number(minMarks);
    if (isActive !== undefined) update.isActive = !!isActive;

    const subject = await Subject.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    }

    return res.json({ success: true, data: subject });
  } catch (err) {
    console.error('updateSubject error:', err);
    return next(err);
  }
};

// DELETE /api/subjects/:id  (Admin) – delete subject
exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    }

    return res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    console.error('deleteSubject error:', err);
    return next(err);
  }
};
