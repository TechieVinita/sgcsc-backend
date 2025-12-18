const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { enrollmentNo, dob } = req.body;

    if (!enrollmentNo || !dob) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number and DOB are required",
      });
    }

    const student = await Student.findOne({
      enrollmentNo: enrollmentNo.trim(),
      dob: dob.trim(),
      isActive: true,
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { studentId: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      student: {
        _id: student._id,
        name: student.name,
        photoUrl: student.photoUrl,
      },
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

module.exports = router;
