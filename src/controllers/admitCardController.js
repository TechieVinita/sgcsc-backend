// server/src/controllers/admitCardController.js
const AdmitCard = require('../models/AdmitCard');
const Student = require('../models/Student');
const Course = require('../models/Course');

/**
 * Helper – parse YYYY-MM-DD into Date or return null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * POST /api/admit-cards
 * Body: { enrollmentNumber, rollNumber, courseId?, courseName?, examCenter, examDate, examTime, studentId? }
 */
exports.createAdmitCard = async (req, res) => {
  try {
    const {
      enrollmentNumber,
      rollNumber,
      courseId,
      courseName,
      examCenter,
      examDate,
      examTime,
      studentId,
    } = req.body || {};

    if (!enrollmentNumber || !rollNumber || !examDate || !examTime) {
      return res.status(400).json({
        success: false,
        message:
          'enrollmentNumber, rollNumber, examDate and examTime are required',
      });
    }

    const parsedExamDate = parseDate(examDate);
    if (!parsedExamDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid examDate format' });
    }

    let studentDoc = null;
    if (studentId) {
      studentDoc = await Student.findById(studentId);
      if (!studentDoc) {
        return res
          .status(404)
          .json({ success: false, message: 'Student not found' });
      }
    }

    let courseDoc = null;
    let finalCourseName = courseName || '';
    if (courseId) {
      courseDoc = await Course.findById(courseId);
      if (!courseDoc) {
        return res
          .status(404)
          .json({ success: false, message: 'Course not found' });
      }
      if (!finalCourseName) {
        finalCourseName = courseDoc.name || courseDoc.title || '';
      }
    }

    const admitCard = await AdmitCard.create({
      enrollmentNumber: String(enrollmentNumber).trim(),
      rollNumber: String(rollNumber).trim(),
      student: studentDoc ? studentDoc._id : null,
      course: courseDoc ? courseDoc._id : null,
      courseName: finalCourseName,
      examCenter: examCenter ? String(examCenter).trim() : '',
      examDate: parsedExamDate,
      examTime: String(examTime).trim(),
    });

    return res.status(201).json({ success: true, data: admitCard });
  } catch (err) {
    console.error('createAdmitCard error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while creating admit card' });
  }
};

/**
 * GET /api/admit-cards
 * Optional query: search (matches enrollmentNumber, rollNumber, courseName)
 */
exports.getAdmitCards = async (req, res) => {
  try {
    const { search } = req.query || {};
    const filter = {};

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [
        { enrollmentNumber: rx },
        { rollNumber: rx },
        { courseName: rx },
      ];
    }

    const cards = await AdmitCard.find(filter)
      .sort({ examDate: -1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: cards });
  } catch (err) {
    console.error('getAdmitCards error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching admit cards' });
  }
};

/**
 * GET /api/admit-cards/:id
 */
exports.getAdmitCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await AdmitCard.findById(id).lean();
    if (!card) {
      return res
        .status(404)
        .json({ success: false, message: 'Admit card not found' });
    }
    return res.json({ success: true, data: card });
  } catch (err) {
    console.error('getAdmitCardById error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching admit card' });
  }
};

/**
 * PUT /api/admit-cards/:id
 * Same body as create; only provided fields will be updated.
 */
exports.updateAdmitCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      enrollmentNumber,
      rollNumber,
      courseId,
      courseName,
      examCenter,
      examDate,
      examTime,
      studentId,
    } = req.body || {};

    const update = {};

    if (enrollmentNumber != null)
      update.enrollmentNumber = String(enrollmentNumber).trim();
    if (rollNumber != null) update.rollNumber = String(rollNumber).trim();
    if (examCenter != null) update.examCenter = String(examCenter).trim();
    if (examTime != null) update.examTime = String(examTime).trim();

    if (examDate != null) {
      const parsedExamDate = parseDate(examDate);
      if (!parsedExamDate) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid examDate format' });
      }
      update.examDate = parsedExamDate;
    }

    if (studentId != null) {
      if (!studentId) {
        update.student = null;
      } else {
        const s = await Student.findById(studentId);
        if (!s) {
          return res
            .status(404)
            .json({ success: false, message: 'Student not found' });
        }
        update.student = s._id;
      }
    }

    if (courseId != null || courseName != null) {
      let finalCourseName = courseName || '';
      if (!courseId) {
        update.course = null;
        if (courseName != null) update.courseName = finalCourseName;
      } else {
        const c = await Course.findById(courseId);
        if (!c) {
          return res
            .status(404)
            .json({ success: false, message: 'Course not found' });
        }
        update.course = c._id;
        if (!finalCourseName) {
          finalCourseName = c.name || c.title || '';
        }
        update.courseName = finalCourseName;
      }
    }

    const card = await AdmitCard.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!card) {
      return res
        .status(404)
        .json({ success: false, message: 'Admit card not found' });
    }

    return res.json({ success: true, data: card });
  } catch (err) {
    console.error('updateAdmitCard error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while updating admit card' });
  }
};

/**
 * DELETE /api/admit-cards/:id
 */
exports.deleteAdmitCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await AdmitCard.findByIdAndDelete(id);
    if (!card) {
      return res
        .status(404)
        .json({ success: false, message: 'Admit card not found' });
    }
    return res.json({ success: true, message: 'Admit card deleted' });
  } catch (err) {
    console.error('deleteAdmitCard error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while deleting admit card' });
  }
};
