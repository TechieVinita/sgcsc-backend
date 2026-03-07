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
    const { enrollmentNumber, dob } = req.body;

    // Try to find by enrollmentNumber first
    let results = await Result.find({
      $or: [
        { enrollmentNumber },
        { rollNumber: enrollmentNumber }
      ]
    });

    // Filter by dob if provided
    if (dob && results.length > 0) {
      const dobDate = new Date(dob);
      results = results.filter(r => {
        if (!r.dob) return true; // Keep results without dob
        return new Date(r.dob).toDateString() === dobDate.toDateString();
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    res.json({
      success: true,
      data: results, // Return array of results
    });
  } catch (err) {
    console.error("Result verification error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= CERTIFICATE ================= */
exports.verifyCertificate = async (req, res) => {
  try {
    const { enrollmentNumber, dob } = req.body;

    // Try to find by enrollmentNumber or certificateNumber
    let certificates = await Certificate.find({
      $or: [
        { enrollmentNumber },
        { certificateNumber: enrollmentNumber }
      ]
    });

    // Filter by dob if provided
    if (dob && certificates.length > 0) {
      const dobDate = new Date(dob);
      certificates = certificates.filter(c => {
        if (!c.dob) return true; // Keep certificates without dob
        return new Date(c.dob).toDateString() === dobDate.toDateString();
      });
    }

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
