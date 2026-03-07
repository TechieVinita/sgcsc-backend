const express = require("express");
const router = express.Router();
const franchiseAuth = require("../middleware/franchiseAuthMiddleware");
const { uploadImage } = require("../middleware/upload");
const Student = require("../models/Student");
const Franchise = require("../models/Franchise");
const Settings = require("../models/Settings");
const CreditTransaction = require("../models/CreditTransaction");

// All routes require franchise authentication
router.use(franchiseAuth);

// Get students for this franchise
router.get("/", async (req, res) => {
  try {
    const franchiseName = req.franchise.instituteName;
    // Find students by centerName matching the franchise's instituteName
    const students = await Student.find({ centerName: franchiseName }).lean();
    
    res.json(students);
  } catch (err) {
    console.error("Franchise get students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single student
router.get("/:id", async (req, res) => {
  try {
    const franchiseName = req.franchise.instituteName;
    const student = await Student.findOne({
      _id: req.params.id,
      centerName: franchiseName
    }).lean();
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(student);
  } catch (err) {
    console.error("Franchise get student error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create student for this franchise
router.post("/", uploadImage.single("photo"), async (req, res) => {
  try {
    // Parse courses if it's a string
    let coursesData = req.body.courses;
    if (typeof coursesData === "string") {
      try {
        coursesData = JSON.parse(coursesData);
      } catch (e) {
        coursesData = [];
      }
    }

    const studentData = {
      ...req.body,
      courses: coursesData,
      centerName: req.franchise.instituteName,
      franchiseId: req.franchise._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add photo URL if uploaded
    if (req.file) {
      studentData.photo = req.file.path;
    }

    const student = new Student(studentData);
    await student.save();

    // Deduct credits for student creation
    try {
      const settings = await Settings.getSettings();
      const creditPricing = settings.creditPricing || { student: 10 };
      const studentCost = creditPricing.student || 10;

      // Get current franchise credits
      const franchise = await Franchise.findById(req.franchise._id);
      const currentCredits = franchise.credits || 0;

      if (currentCredits >= studentCost) {
        // Deduct credits
        franchise.credits = currentCredits - studentCost;
        franchise.totalCreditsUsed = (franchise.totalCreditsUsed || 0) + studentCost;
        await franchise.save();

        // Create transaction record
        await CreditTransaction.create({
          franchise: franchise._id,
          type: 'deduction',
          amount: studentCost,
          description: `Student enrollment: ${studentData.name} (${studentData.rollNumber || studentData.enrollmentNo})`,
          balanceAfter: franchise.credits,
        });
      }
    } catch (creditErr) {
      console.error("Error deducting credits:", creditErr);
      // Continue even if credit deduction fails - student is still created
    }

    res.status(201).json(student);
  } catch (err) {
    console.error("Franchise create student error:", err);
    
    // Handle duplicate key error - show enrollment number error for all duplicates
    if (err.code === 11000) {
      return res.status(400).json({ message: "A student with this enrollment number already exists" });
    }
    
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Update student
router.put("/:id", uploadImage.single("photo"), async (req, res) => {
  try {
    const franchiseName = req.franchise.instituteName;
    
    // Parse courses if it's a string
    let coursesData = req.body.courses;
    if (typeof coursesData === "string") {
      try {
        coursesData = JSON.parse(coursesData);
      } catch (e) {
        coursesData = undefined;
      }
    }
    
    const updateData = {
      ...req.body,
      courses: coursesData,
      updatedAt: new Date(),
    };

    // Add photo URL if uploaded
    if (req.file) {
      updateData.photo = req.file.path;
    }

    const student = await Student.findOneAndUpdate(
      { 
        _id: req.params.id,
        centerName: franchiseName
      },
      updateData,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    console.error("Franchise update student error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    const franchiseName = req.franchise.instituteName;
    const result = await Student.findOneAndDelete({
      _id: req.params.id,
      centerName: franchiseName
    });

    if (!result) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Franchise delete student error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
