// server/src/routes/assignmentRoutes.js
const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middleware/authMiddleware");
const { uploadAssignment } = require("../middleware/upload");
const assignmentController = require("../controllers/assignmentController");

// Base: /api/assignments

// List (admin)
router.get("/", verifyAdmin, assignmentController.getAssignments);

// Create (upload assignment file)
router.post(
  "/",
  verifyAdmin,
  uploadAssignment.single("file"),
  assignmentController.createAssignment
);

// Update description
router.put("/:id", verifyAdmin, assignmentController.updateAssignment);

// Delete (DB + Cloudinary)
router.delete("/:id", verifyAdmin, assignmentController.deleteAssignment);

// Download (redirect to Cloudinary)
router.get("/:id/download", verifyAdmin, assignmentController.downloadAssignment);

module.exports = router;
