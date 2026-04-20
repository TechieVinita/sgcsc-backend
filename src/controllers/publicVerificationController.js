const Student = require("../models/Student");
const Result = require("../models/Result");
const Certificate = require("../models/Certificate");

/* ================= ENROLLMENT ================= */
exports.verifyEnrollment = async (req, res) => {
  try {
    const { rollNumber, dob } = req.body;

    // Find by rollNumber
    const student = await Student.findOne({
      rollNumber,
      dob: new Date(dob),
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

/* ================= RESULT ================= */
exports.verifyResult = async (req, res) => {
  try {
    const { rollNumber, dob } = req.body;

    // Find by rollNumber
    let results = await Result.find({ rollNumber });

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
    const { rollNumber, dob } = req.body;

    // Find student by rollNumber and dob
    const student = await Student.findOne({
      rollNumber,
      dob: new Date(dob),
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
