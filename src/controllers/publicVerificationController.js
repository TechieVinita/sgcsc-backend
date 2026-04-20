const Student = require("../models/Student");
const Result = require("../models/Result");
const Certificate = require("../models/Certificate");
const Marksheet = require("../models/Marksheet");

/* ================= ENROLLMENT ================= */
exports.verifyEnrollment = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    // Find by rollNumber only
    const student = await Student.findOne({
      rollNumber,
    }).select("-password");

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

// Helper function to parse DD-MM-YYYY date string
const parseDob = (dobStr) => {
  if (!dobStr) return null;
  const [day, month, year] = dobStr.split('-');
  if (!day || !month || !year) return null;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/* ================= RESULT ================= */
exports.verifyResult = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    // Find marksheets by rollNumber only (marksheets are the final results)
    const marksheets = await Marksheet.find({ rollNumber });

    if (!marksheets || marksheets.length === 0) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    res.json({
      success: true,
      data: marksheets, // Return array of marksheets
    });
  } catch (err) {
    console.error("Result verification error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= CERTIFICATE ================= */
exports.verifyCertificate = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    // Find student by rollNumber only
    const student = await Student.findOne({
      rollNumber,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Find certificates by student's enrollmentNumber
    const certificates = await Certificate.find({
      enrollmentNumber: student.enrollmentNo || student.rollNumber
    });

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    res.json({
      success: true,
      data: certificates, // Return array of certificates
    });
  } catch (err) {
    console.error("Certificate verification error:", err);
    res.status(500).json({ success: false });
  }
};
