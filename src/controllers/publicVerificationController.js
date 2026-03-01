const Student = require("../models/Student");
const Result = require("../models/Result");
const Certificate = require("../models/Certificate");

/* ================= ENROLLMENT ================= */
exports.verifyEnrollment = async (req, res) => {
  try {
    const { enrollmentNo, dob } = req.body;

    // First try to find by enrollmentNo, then fallback to rollNumber
    let student = await Student.findOne({
      enrollmentNo,
      dob: new Date(dob),
    }).select("-password");

    // If not found, try with rollNumber
    if (!student) {
      student = await Student.findOne({
        rollNumber: enrollmentNo,
        dob: new Date(dob),
      }).select("-password");
    }

    if (!student) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      data: {
        name: student.name,
        course: student.courseName,
        session: student.sessionStart && student.sessionEnd 
          ? `${new Date(student.sessionStart).getFullYear()} - ${new Date(student.sessionEnd).getFullYear()}`
          : '-',
        status: student.isCertified ? 'Certified' : 'Enrolled',
      },
    });
  } catch (err) {
    console.error("Enrollment verification error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= RESULT ================= */
exports.verifyResult = async (req, res) => {
  try {
    const { rollNo, dob } = req.body;

    const result = await Result.findOne({
      rollNo,
      dob: new Date(dob),
    });

    if (!result) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ================= CERTIFICATE ================= */
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateNo, dob } = req.body;

    const cert = await Certificate.findOne({
      certificateNo,
      dob: new Date(dob),
    });

    if (!cert) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      data: cert,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
