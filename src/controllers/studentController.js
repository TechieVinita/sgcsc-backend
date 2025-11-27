// server/src/controllers/studentController.js
const Student = require('../models/Student');
const Course = require('../models/Course');

// GET /api/students  (admin – full list)
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({})
      .populate('course', 'name')           // << get course name
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    next(err);
  }
};

// POST /api/students  (admin – create)
exports.addStudent = async (req, res, next) => {
  try {
    const {
      rollNo,
      name,
      email,
      course,      // we send this from frontend
      courseId,    // and this, just in case
      semester,
      joinDate,
      dob,
      contact,
      address,
      isCertified,
    } = req.body;

    const courseRef = course || courseId;

    if (!rollNo || !name || !courseRef || !joinDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Please fill all required fields' });
    }

    // ensure course exists (optional but safer)
    const courseDoc = await Course.findById(courseRef);
    if (!courseDoc) {
      return res
        .status(400)
        .json({ success: false, message: 'Selected course does not exist' });
    }

    const existing = await Student.findOne({ rollNo });
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
      joinDate: joinDate || undefined,
      dob: dob || undefined,
      contact: contact || undefined,
      address: address || undefined,
      isCertified: !!isCertified,
    });

    await student.populate('course', 'name');

    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id  (admin – update)
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

    // drop undefined keys
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const student = await Student.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('course', 'name');

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};

// PUBLIC: GET /api/students/recent-home
exports.getRecentStudentsForHome = async (req, res, next) => {
  try {
    const students = await Student.find({
      joinDate: { $ne: null },
    })
      .populate('course', 'name')
      .sort({ joinDate: -1 })
      .limit(12);

    res.json(students);
  } catch (err) {
    next(err);
  }
};

// PUBLIC: GET /api/students/certified-home
exports.getCertifiedStudentsForHome = async (req, res, next) => {
  try {
    const students = await Student.find({ isCertified: true })
      .populate('course', 'name')
      .sort({ joinDate: -1 })
      .limit(12);

    res.json(students);
  } catch (err) {
    next(err);
  }
};
