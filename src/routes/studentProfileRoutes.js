const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const studentAuth = require("../middleware/studentAuth");

router.get("/me", studentAuth, async (req, res) => {
  const student = await Student.findById(req.studentId).lean();

  if (!student) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, data: student });
});

module.exports = router;
