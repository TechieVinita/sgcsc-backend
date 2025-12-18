// server/src/controllers/studentController.js
const Student = require('../models/Student');

/* ---------- POST /api/students ---------- */
exports.createStudent = async (req, res, next) => {
  try {
    const body = req.body || {};

    const {
      // rollNo is intentionally ignored – you don’t want it
      name,
      gender,
      fatherName,
      motherName,
      dob,
      email,
      mobile,          // sent by frontend as +91XXXXXXXXXX
      state,
      district,
      address,
      centerName,
      examPassed,
      marksOrGrade,
      board,
      passingYear,
      username,
      password,
      courseId,
      courseName,
      sessionStart,
      sessionEnd,
    } = body;

    if (!centerName || !name || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'centerName, name and mobile are required.',
      });
    }

    const student = new Student({
      name: name.trim(),
      gender: gender || '',
      dob: dob || null,

      centerName: centerName.trim(),
      fatherName: fatherName || '',
      motherName: motherName || '',

      email: email || '',
      contact: mobile, // already has +91 prefix from frontend

      state: state || '',
      district: district || '',
      address: address || '',

      examPassed: examPassed || '',
      marksOrGrade: marksOrGrade || '',
      board: board || '',
      passingYear: passingYear || '',

      course: courseId || null,
      courseName: courseName || '',
      sessionStart: sessionStart || null,
      sessionEnd: sessionEnd || null,
      joinDate: sessionStart || new Date(),

      username: username || '',
      password: password || '', // hashed in pre-save hook

      photo: `/uploads/${req.file.filename}`,
    });

    await student.save();

    return res.status(201).json({ success: true, data: student });
  } catch (err) {
    console.error('createStudent error:', err);
    return next(err);
  }
};

/* ---------- GET /api/students/recent ---------- */
exports.getRecentStudents = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 10);

    const students = await Student.find({})
      .sort({
        sessionStart: -1,   // priority
        createdAt: -1,      // fallback
      })
      .limit(limit)
      .select('name photo courseName sessionStart createdAt')
      .lean();

    return res.json({
      success: true,
      data: students,
    });
  } catch (err) {
    console.error('getRecentStudents error:', err);
    return next(err);
  }
};


exports.getCertifiedStudents = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 10);

    const students = await Student.find({ isCertified: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name photo courseName')
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

exports.getCertifiedStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ isCertified: true })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('name photo courseName')
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};




/* ---------- GET /api/students ---------- */
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: students });
  } catch (err) {
    console.error('getStudents error:', err);
    return next(err);
  }
};

/* ---------- GET /api/students/:id ---------- */
// In studentController.js - getStudent functio
exports.getStudent = async (req, res, next) => {
  try {
    // Validate ObjectId format BEFORE querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student ID format' 
      });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.json({ success: true, data: student });
  } catch (err) {
    console.error('getStudent error:', err);
    return next(err);
  }
};


/* ---------- PUT /api/students/:id ---------- */
exports.updateStudent = async (req, res, next) => {
  try {
    const body = req.body || {};

    const {
      name,
      gender,
      fatherName,
      motherName,
      dob,
      email,
      mobile,
      state,
      district,
      address,
      centerName,
      examPassed,
      marksOrGrade,
      board,
      passingYear,
      username,
      password,
      courseId,
      courseName,
      sessionStart,
      sessionEnd,
      isCertified,
    } = body;

    const update = {
      name,
      gender,
      fatherName,
      motherName,
      dob: dob || null,
      email,
      contact: mobile,
      state,
      district,
      address,
      centerName,
      examPassed,
      marksOrGrade,
      board,
      passingYear,
      username,
      course: courseId || undefined,
      courseName,
      sessionStart: sessionStart || null,
      sessionEnd: sessionEnd || null,
      isCertified:
        typeof isCertified !== 'undefined' ? isCertified === 'true' || isCertified === true : undefined,
    };

    // password handled specially
    if (password) {
      update.password = password;
    }

    // optional new photo
    if (req.file && req.file.filename) {
  update.photo = `/uploads/${req.file.filename}`;
}


    // drop undefined keys
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    Object.assign(student, update);
    await student.save();

    return res.json({ success: true, data: student });
  } catch (err) {
    console.error('updateStudent error:', err);
    return next(err);
  }
};

/* ---------- DELETE /api/students/:id ---------- */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }
    return res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    console.error('deleteStudent error:', err);
    return next(err);
  }
};
