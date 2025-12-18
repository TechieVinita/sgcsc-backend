const mongoose = require("mongoose");
const Student = require("../models/Student");

/* ---------- POST /api/students ---------- */
exports.createStudent = async (req, res) => {
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
    } = body;

    if (!name || !mobile || !centerName) {
      return res.status(400).json({
        success: false,
        message: "name, mobile and centerName are required",
      });
    }

    const student = await Student.create({
      name: name.trim(),
      gender: gender || "",
      dob: dob || null,

      fatherName: fatherName || "",
      motherName: motherName || "",
      centerName: centerName.trim(),

      email: email || "",
      contact: mobile,

      state: state || "",
      district: district || "",
      address: address || "",

      examPassed: examPassed || "",
      marksOrGrade: marksOrGrade || "",
      board: board || "",
      passingYear: passingYear || "",

      course: courseId || null,
      courseName: courseName || "",
      sessionStart: sessionStart || null,
      sessionEnd: sessionEnd || null,
      joinDate: sessionStart || new Date(),

      username: username || "",
      password: password || "",

      // 🔥 Cloudinary URL
      photo: req.file?.path || "",
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    console.error("createStudent error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------- GET /api/students/recent-home ---------- */
exports.getRecentStudents = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 10);

    const students = await Student.find({})
      .sort({ sessionStart: -1, createdAt: -1 })
      .limit(limit)
      .select("name photo courseName sessionStart createdAt")
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("getRecentStudents error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- GET /api/students/certified-home ---------- */
exports.getCertifiedStudents = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 10);

    const students = await Student.find({ isCertified: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select("name photo courseName")
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("getCertifiedStudents error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- GET /api/students ---------- */
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- GET /api/students/:id ---------- */
exports.getStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    console.error("getStudent error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- PUT /api/students/:id ---------- */
exports.updateStudent = async (req, res) => {
  try {
    const update = { ...req.body };

    if (req.file?.path) {
      update.photo = req.file.path; // Cloudinary URL
    }

    if (update.isCertified !== undefined) {
      update.isCertified =
        update.isCertified === true || update.isCertified === "true";
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    console.error("updateStudent error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- DELETE /api/students/:id ---------- */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ success: false });
  }
};
