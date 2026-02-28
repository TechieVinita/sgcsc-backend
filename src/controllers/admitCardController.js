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
 * Body: { rollNumber, studentName, fatherName, motherName, courseName, instituteName, examCenterAddress, examDate, examTime, reportingTime, examDuration, courseId?, studentId? }
 */
exports.createAdmitCard = async (req, res) => {
  try {
    const {
      rollNumber,
      studentName,
      fatherName,
      motherName,
      courseName,
      instituteName,
      examCenterAddress,
      examDate,
      examTime,
      reportingTime,
      examDuration,
      courseId,
      studentId,
    } = req.body || {};

    // Validate required fields
    if (!rollNumber || !studentName || !fatherName || !motherName || !courseName || !instituteName || !examCenterAddress || !examDate || !examTime || !reportingTime || !examDuration) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: rollNumber, studentName, fatherName, motherName, courseName, instituteName, examCenterAddress, examDate, examTime, reportingTime, examDuration',
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
    if (courseId) {
      courseDoc = await Course.findById(courseId);
      if (!courseDoc) {
        return res
          .status(404)
          .json({ success: false, message: 'Course not found' });
      }
    }

    const admitCard = await AdmitCard.create({
      rollNumber: String(rollNumber).trim(),
      studentName: String(studentName).trim(),
      fatherName: String(fatherName).trim(),
      motherName: String(motherName).trim(),
      courseName: String(courseName).trim(),
      instituteName: String(instituteName).trim(),
      examCenterAddress: String(examCenterAddress).trim(),
      examDate: parsedExamDate,
      examTime: String(examTime).trim(),
      reportingTime: String(reportingTime).trim(),
      examDuration: String(examDuration).trim(),
      student: studentDoc ? studentDoc._id : null,
      course: courseDoc ? courseDoc._id : null,
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
 * Optional query: search (matches rollNumber, studentName, courseName)
 */
exports.getAdmitCards = async (req, res) => {
  try {
    const { search } = req.query || {};
    const filter = {};

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [
        { rollNumber: rx },
        { studentName: rx },
        { courseName: rx },
        { instituteName: rx },
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
      rollNumber,
      studentName,
      fatherName,
      motherName,
      courseName,
      instituteName,
      examCenterAddress,
      examDate,
      examTime,
      reportingTime,
      examDuration,
      courseId,
      studentId,
    } = req.body || {};

    const update = {};

    if (rollNumber != null) update.rollNumber = String(rollNumber).trim();
    if (studentName != null) update.studentName = String(studentName).trim();
    if (fatherName != null) update.fatherName = String(fatherName).trim();
    if (motherName != null) update.motherName = String(motherName).trim();
    if (courseName != null) update.courseName = String(courseName).trim();
    if (instituteName != null) update.instituteName = String(instituteName).trim();
    if (examCenterAddress != null) update.examCenterAddress = String(examCenterAddress).trim();
    if (examTime != null) update.examTime = String(examTime).trim();
    if (reportingTime != null) update.reportingTime = String(reportingTime).trim();
    if (examDuration != null) update.examDuration = String(examDuration).trim();

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

    if (courseId != null) {
      if (!courseId) {
        update.course = null;
      } else {
        const c = await Course.findById(courseId);
        if (!c) {
          return res
            .status(404)
            .json({ success: false, message: 'Course not found' });
        }
        update.course = c._id;
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
