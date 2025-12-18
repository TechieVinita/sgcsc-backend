const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

/* ===========================
   STUDENT LOGIN
=========================== */
router.post("/student-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const student = await Student.findOne({ username });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      data: student,
    });
  } catch (err) {
    console.error("❌ Student login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
