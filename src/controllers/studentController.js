// server/src/controllers/studentController.js
const Student = require('../models/Student');
const Course = require('../models/Course');

// Helper to compute a display name for the course
const getCourseDisplayName = (course) => {
  if (!course) return '-';
  return course.name || course.title || '-';
};

/* ============================================================
   GET /api/students (admin – full list)
   Ensures course name/title is always included
============================================================ */
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({})
      .populate({ path: 'course', select: 'name title' }) // pull both, whichever exists
      .sort({ createdAt: -1 })
      .lean();

    // Ensure consistent frontend structure
    students.forEach((s) => {
      s.courseName = getCourseDisplayName(s.course);
    });

    return res.json({ success: true, data: students });
  } catch (err) {
    console.error('getStudents error:', err);
    next(err);
  }
};

/* ============================================================
   POST /api/students (admin – create)
============================================================ */
exports.addStudent = async (req, res, next) => {
  try {
    const {
      rollNo,
      name,
      email,
      course,
      courseId,
      semester,
      joinDate,
      dob,
      contact,
      address,
      isCertified,
    } = req.body;

    const courseRef = course || courseId;

    if (!rollNo || !name || !courseRef || !joinDate) {
      return res.status(400).json({
        success: false,
        message:
          'Please fill all required fields (Roll No, Name, Course, Join Date)',
      });
    }

    const courseDoc = await Course.findById(courseRef);
    if (!courseDoc) {
      return res.status(400).json({
        success: false,
        message: 'Selected course does not exist',
      });
    }

    const existing = await Student.findOne({ rollNo: String(rollNo).trim() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Roll No already exists' });
    }

    const student = await Student.create({
      rollNo: String(rollNo).trim(),
      name: String(name).trim(),
      email: email || undefined,
      course: courseDoc._id,
      semester: semester || 1,
      joinDate,
      dob: dob || undefined,
      contact: contact || undefined,
      address: address || undefined,
      isCertified: !!isCertified,
    });

    // Populate course after creation
    await student.populate({ path: 'course', select: 'name title' });
    const json = student.toObject();
    json.courseName = getCourseDisplayName(json.course);

    return res.status(201).json({ success: true, data: json });
  } catch (err) {
    console.error('addStudent error:', err);
    next(err);
  }
};

/* ============================================================
   PUT /api/students/:id (admin – update)
============================================================ */
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      rollNo,
      name,
      email,
      course,
      courseId,
      semester,
      joinDate,
      dob,
      contact,
      address,
      isCertified,
    } = req.body;

    const courseRef = course || courseId || undefined;
    const update = {
      rollNo: rollNo !== undefined ? String(rollNo).trim() : undefined,
      name: name !== undefined ? String(name).trim() : undefined,
      email,
      semester,
      joinDate,
      dob,
      contact,
      address,
      isCertified: isCertified !== undefined ? !!isCertified : undefined,
    };

    if (courseRef) {
      const courseDoc = await Course.findById(courseRef);
      if (!courseDoc) {
        return res
          .status(400)
          .json({ success: false, message: 'Selected course does not exist' });
      }
      update.course = courseDoc._id;
    }

    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const student = await Student.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate({ path: 'course', select: 'name title' })
      .lean();

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    student.courseName = getCourseDisplayName(student.course);

    return res.json({ success: true, data: student });
  } catch (err) {
    console.error('updateStudent error:', err);
    next(err);
  }
};

/* ============================================================
   DELETE /api/students/:id (admin – delete)
============================================================ */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }
    return res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (err) {
    console.error('deleteStudent error:', err);
    next(err);
  }
};

/* ============================================================
   PUBLIC endpoints for website home page
============================================================ */
exports.getRecentStudentsForHome = async (req, res, next) => {
  try {
    const students = await Student.find({ joinDate: { $ne: null } })
      .populate({ path: 'course', select: 'name title' })
      .sort({ joinDate: -1 })
      .limit(12)
      .lean();

    students.forEach((s) => {
      s.courseName = getCourseDisplayName(s.course);
    });

    res.json({ success: true, data: students });
  } catch (err) {
    console.error('getRecentStudentsForHome error:', err);
    next(err);
  }
};

exports.getCertifiedStudentsForHome = async (req, res, next) => {
  try {
    const students = await Student.find({ isCertified: true })
      .populate({ path: 'course', select: 'name title' })
      .sort({ joinDate: -1 })
      .limit(12)
      .lean();

    students.forEach((s) => {
      s.courseName = getCourseDisplayName(s.course);
    });

    res.json({ success: true, data: students });
  } catch (err) {
    console.error('getCertifiedStudentsForHome error:', err);
    next(err);
  }
};
