const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Result = require("../models/Result");
const Certificate = require("../models/Certificate");
const studentAuth = require("../middleware/studentAuth");

router.get("/me", studentAuth, async (req, res) => {
  const student = await Student.findById(req.studentId).lean();

  if (!student) {
    return res.status(404).json({ success: false });
  }

  // Calculate fee totals and course name from courses array (if available) or fallback to legacy fields
  let totalFee = 0;
  let totalPaid = 0;

  if (student.courses && Array.isArray(student.courses) && student.courses.length > 0) {
    // Calculate from courses array
    totalFee = student.courses.reduce((sum, c) => sum + (Number(c.feeAmount) || 0), 0);
    totalPaid = student.courses.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0);
    // Use course name from first course in array
    student.courseName = student.courses[0].courseName || student.courseName;
  } else {
    // Fallback to legacy fields
    totalFee = student.feeAmount || 0;
    totalPaid = student.amountPaid || 0;
  }

  student.feeAmount = totalFee;
  student.amountPaid = totalPaid;
  student.pendingAmount = totalFee - totalPaid;
  // Ensure courses array is available for frontend display
  student.courses = student.courses || [];

  res.json({ success: true, data: student });
});

/* ================= STUDENT ENROLLMENT INFO ================= */
router.get("/enrollment", studentAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select("-password").lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Use enrollmentNo if available, otherwise use rollNumber
    const enrollmentNo = student.enrollmentNo || student.rollNumber;

    // Calculate fee totals and course name from courses array (if available) or fallback to legacy fields
    let totalFee = 0;
    let totalPaid = 0;
    let courseName = student.courseName;

    if (student.courses && Array.isArray(student.courses) && student.courses.length > 0) {
      // Calculate from courses array
      totalFee = student.courses.reduce((sum, c) => sum + (Number(c.feeAmount) || 0), 0);
      totalPaid = student.courses.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0);
      // Use course name from first course in array
      courseName = student.courses[0].courseName || student.courseName;
    } else {
      // Fallback to legacy fields
      totalFee = student.feeAmount || 0;
      totalPaid = student.amountPaid || 0;
    }

    res.json({
      success: true,
      data: {
        enrollmentNo: enrollmentNo,
        rollNumber: student.rollNumber,
        name: student.name,
        fatherName: student.fatherName,
        motherName: student.motherName,
        dob: student.dob,
        course: courseName,
        centerName: student.centerName,
        sessionStart: student.sessionStart,
        sessionEnd: student.sessionEnd,
        feesPaid: student.feesPaid,
        isCertified: student.isCertified,
        joinDate: student.joinDate,
        // Fee details
        feeAmount: totalFee,
        amountPaid: totalPaid,
        pendingAmount: totalFee - totalPaid,
        paymentDate: student.paymentDate,
        // All courses for display
        courses: student.courses || [],
      },
    });
  } catch (err) {
    console.error("Enrollment fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= STUDENT RESULT ================= */
router.get("/result", studentAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Find ALL results by rollNumber (multiple courses)
    const results = await Result.find({ rollNumber: student.rollNumber })
      .populate("course", "name")
      .populate("subjects.subject", "name code")
      .lean();

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: "No results found" });
    }

    // Add student info to each result
    const resultsWithStudentInfo = results.map(result => ({
      ...result,
      studentName: student.name,
      rollNumber: student.rollNumber,
      courseName: result.course?.name || student.courseName,
    }));

    res.json({
      success: true,
      data: resultsWithStudentInfo,
    });
  } catch (err) {
    console.error("Result fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= STUDENT CERTIFICATE ================= */
router.get("/certificate", studentAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Use enrollmentNo if available, otherwise use rollNumber
    const enrollmentNo = student.enrollmentNo || student.rollNumber;

    // Find ALL certificates by enrollmentNumber (multiple courses)
    const certificates = await Certificate.find({ enrollmentNumber: enrollmentNo }).lean();

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ success: false, message: "No certificates found" });
    }

    res.json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    console.error("Certificate fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
