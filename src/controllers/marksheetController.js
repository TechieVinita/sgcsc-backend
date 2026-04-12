// server/src/controllers/marksheetController.js
const Marksheet = require('../models/Marksheet');
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
 * Helper – calculate grade based on percentage
 */
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

/**
 * POST /api/marksheets
 * Create a new marksheet
 */
exports.createMarksheet = async (req, res) => {
  try {
    const {
      enrollmentNo,
      studentName,
      fatherName,
      motherName,
      courseName,
      instituteName,
      rollNumber,
      dob,
      coursePeriodFrom,
      coursePeriodTo,
      courseDuration,
      dateOfIssue,
      subjects,
      studentId,
      courseId,
    } = req.body || {};

    // Validate required fields
    if (
      !enrollmentNo ||
      !studentName ||
      !fatherName ||
      !motherName ||
      !courseName ||
      !instituteName ||
      !rollNumber ||
      !dob ||
      !coursePeriodFrom ||
      !coursePeriodTo ||
      !courseDuration ||
      !subjects ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: enrollmentNo, studentName, fatherName, motherName, courseName, instituteName, rollNumber, dob, coursePeriodFrom, coursePeriodTo, courseDuration, subjects',
      });
    }

    // Parse dates
    const parsedDob = parseDate(dob);
    const parsedPeriodFrom = parseDate(coursePeriodFrom);
    const parsedPeriodTo = parseDate(coursePeriodTo);

    if (!parsedDob || !parsedPeriodFrom || !parsedPeriodTo) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for dob, coursePeriodFrom, or coursePeriodTo',
      });
    }

    // Calculate marks for each subject and totals
    let totalTheoryMarks = 0;
    let totalPracticalMarks = 0;
    let totalCombinedMarks = 0;
    let maxTotalMarks = 0;

    const processedSubjects = subjects.map((subject) => {
      const theoryMarks = Number(subject.theoryMarks) || 0;
      const practicalMarks = Number(subject.practicalMarks) || 0;
      const maxTheoryMarks = Number(subject.maxTheoryMarks) || 100;
      const maxPracticalMarks = Number(subject.maxPracticalMarks) || 0;

      const combinedMarks = theoryMarks + practicalMarks;
      const maxCombinedMarks = maxTheoryMarks + maxPracticalMarks;

      totalTheoryMarks += theoryMarks;
      totalPracticalMarks += practicalMarks;
      totalCombinedMarks += combinedMarks;
      maxTotalMarks += maxCombinedMarks;

      return {
        subjectName: subject.subjectName?.trim() || '',
        theoryMarks,
        practicalMarks,
        maxTheoryMarks,
        maxPracticalMarks,
        combinedMarks,
        maxCombinedMarks,
        grade: subject.grade?.trim() || '',
      };
    });

    // Calculate percentage and overall grade
    const percentage = maxTotalMarks > 0 ? (totalCombinedMarks / maxTotalMarks) * 100 : 0;
    const overallGrade = calculateGrade(percentage);

    // Optional: link to student/course if provided
    let studentDoc = null;
    if (studentId) {
      studentDoc = await Student.findById(studentId);
    }

    let courseDoc = null;
    if (courseId) {
      courseDoc = await Course.findById(courseId);
    }

    const marksheet = await Marksheet.create({
      enrollmentNo: String(enrollmentNo).trim(),
      studentName: String(studentName).trim(),
      fatherName: String(fatherName).trim(),
      motherName: String(motherName).trim(),
      courseName: String(courseName).trim(),
      instituteName: String(instituteName).trim(),
      rollNumber: String(rollNumber).trim(),
      dob: parsedDob,
      coursePeriodFrom: parsedPeriodFrom,
      coursePeriodTo: parsedPeriodTo,
      courseDuration: String(courseDuration).trim(),
      dateOfIssue: parseDate(dateOfIssue),
      subjects: processedSubjects,
      totalTheoryMarks,
      totalPracticalMarks,
      totalCombinedMarks,
      maxTotalMarks,
      percentage: Math.round(percentage * 100) / 100,
      overallGrade,
      student: studentDoc ? studentDoc._id : null,
      course: courseDoc ? courseDoc._id : null,
    });

    return res.status(201).json({ success: true, data: marksheet });
  } catch (err) {
    console.error('createMarksheet error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while creating marksheet' });
  }
};

/**
 * GET /api/marksheets
 * List all marksheets with optional search
 */
exports.getMarksheets = async (req, res) => {
  try {
    const { search } = req.query || {};
    const filter = {};

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [
        { enrollmentNo: rx },
        { rollNumber: rx },
        { studentName: rx },
        { courseName: rx },
        { instituteName: rx },
      ];
    }

    const marksheets = await Marksheet.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: marksheets });
  } catch (err) {
    console.error('getMarksheets error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching marksheets' });
  }
};

/**
 * GET /api/marksheets/:id
 * Get single marksheet by ID
 */
exports.getMarksheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const marksheet = await Marksheet.findById(id).lean();
    if (!marksheet) {
      return res
        .status(404)
        .json({ success: false, message: 'Marksheet not found' });
    }
    return res.json({ success: true, data: marksheet });
  } catch (err) {
    console.error('getMarksheetById error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching marksheet' });
  }
};

/**
 * PUT /api/marksheets/:id
 * Update marksheet
 */
exports.updateMarksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      enrollmentNo,
      studentName,
      fatherName,
      motherName,
      courseName,
      instituteName,
      rollNumber,
      dob,
      coursePeriodFrom,
      coursePeriodTo,
      courseDuration,
      dateOfIssue,
      subjects,
      studentId,
      courseId,
    } = req.body || {};

    const update = {};

    if (enrollmentNo != null) update.enrollmentNo = String(enrollmentNo).trim();
    if (studentName != null) update.studentName = String(studentName).trim();
    if (fatherName != null) update.fatherName = String(fatherName).trim();
    if (motherName != null) update.motherName = String(motherName).trim();
    if (courseName != null) update.courseName = String(courseName).trim();
    if (instituteName != null) update.instituteName = String(instituteName).trim();
    if (rollNumber != null) update.rollNumber = String(rollNumber).trim();
    if (courseDuration != null) update.courseDuration = String(courseDuration).trim();
    if (dateOfIssue != null) {
      const parsedDateOfIssue = parseDate(dateOfIssue);
      if (!parsedDateOfIssue) {
        return res.status(400).json({ success: false, message: 'Invalid dateOfIssue format' });
      }
      update.dateOfIssue = parsedDateOfIssue;
    }

    if (dob != null) {
      const parsedDob = parseDate(dob);
      if (!parsedDob) {
        return res.status(400).json({ success: false, message: 'Invalid dob format' });
      }
      update.dob = parsedDob;
    }

    if (coursePeriodFrom != null) {
      const parsedPeriodFrom = parseDate(coursePeriodFrom);
      if (!parsedPeriodFrom) {
        return res.status(400).json({ success: false, message: 'Invalid coursePeriodFrom format' });
      }
      update.coursePeriodFrom = parsedPeriodFrom;
    }

    if (coursePeriodTo != null) {
      const parsedPeriodTo = parseDate(coursePeriodTo);
      if (!parsedPeriodTo) {
        return res.status(400).json({ success: false, message: 'Invalid coursePeriodTo format' });
      }
      update.coursePeriodTo = parsedPeriodTo;
    }

    // Recalculate marks if subjects are provided
    if (subjects && Array.isArray(subjects)) {
      let totalTheoryMarks = 0;
      let totalPracticalMarks = 0;
      let totalCombinedMarks = 0;
      let maxTotalMarks = 0;

      const processedSubjects = subjects.map((subject) => {
        const theoryMarks = Number(subject.theoryMarks) || 0;
        const practicalMarks = Number(subject.practicalMarks) || 0;
        const maxTheoryMarks = Number(subject.maxTheoryMarks) || 100;
        const maxPracticalMarks = Number(subject.maxPracticalMarks) || 0;

        const combinedMarks = theoryMarks + practicalMarks;
        const maxCombinedMarks = maxTheoryMarks + maxPracticalMarks;

        totalTheoryMarks += theoryMarks;
        totalPracticalMarks += practicalMarks;
        totalCombinedMarks += combinedMarks;
        maxTotalMarks += maxCombinedMarks;

        return {
          subjectName: subject.subjectName?.trim() || '',
          theoryMarks,
          practicalMarks,
          maxTheoryMarks,
          maxPracticalMarks,
          combinedMarks,
          maxCombinedMarks,
          grade: subject.grade?.trim() || '',
        };
      });

      const percentage = maxTotalMarks > 0 ? (totalCombinedMarks / maxTotalMarks) * 100 : 0;
      const overallGrade = calculateGrade(percentage);

      update.subjects = processedSubjects;
      update.totalTheoryMarks = totalTheoryMarks;
      update.totalPracticalMarks = totalPracticalMarks;
      update.totalCombinedMarks = totalCombinedMarks;
      update.maxTotalMarks = maxTotalMarks;
      update.percentage = Math.round(percentage * 100) / 100;
      update.overallGrade = overallGrade;
    }

    if (studentId != null) {
      if (!studentId) {
        update.student = null;
      } else {
        const s = await Student.findById(studentId);
        if (!s) {
          return res.status(404).json({ success: false, message: 'Student not found' });
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
          return res.status(404).json({ success: false, message: 'Course not found' });
        }
        update.course = c._id;
      }
    }

    const marksheet = await Marksheet.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!marksheet) {
      return res
        .status(404)
        .json({ success: false, message: 'Marksheet not found' });
    }

    return res.json({ success: true, data: marksheet });
  } catch (err) {
    console.error('updateMarksheet error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while updating marksheet' });
  }
};

/**
 * DELETE /api/marksheets/:id
 * Delete marksheet
 */
exports.deleteMarksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const marksheet = await Marksheet.findByIdAndDelete(id);
    if (!marksheet) {
      return res
        .status(404)
        .json({ success: false, message: 'Marksheet not found' });
    }
    return res.json({ success: true, message: 'Marksheet deleted' });
  } catch (err) {
    console.error('deleteMarksheet error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while deleting marksheet' });
  }
};

/**
 * GET /api/marksheets/student/:enrollmentNo
 * Get student details by enrollment number (for auto-fill)
 */
exports.getStudentByEnrollment = async (req, res) => {
  try {
    const { enrollmentNo } = req.params;
    const student = await Student.findOne({ enrollmentNo }).lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this enrollment number',
      });
    }

    // Get course details if available
    let courseName = student.courseName || '';
    let instituteName = student.centerName || '';

    if (student.course) {
      const course = await Course.findById(student.course).lean();
      if (course) {
        courseName = course.name || courseName;
      }
    }

    return res.json({
      success: true,
      data: {
        studentName: student.name || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        rollNumber: student.rollNumber || '',
        dob: student.dob || null,
        courseName,
        instituteName,
        studentId: student._id,
        courseId: student.course || null,
      },
    });
  } catch (err) {
    console.error('getStudentByEnrollment error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching student details' });
  }
};
