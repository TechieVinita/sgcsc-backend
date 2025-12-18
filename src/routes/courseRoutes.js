// server/src/routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/upload");

const {
  addCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

// Public
router.get("/", getCourses);
router.get("/:id", getCourse);

// Admin
router.post(
  "/",
  verifyAdmin,
  uploadImage.single("image"),
  addCourse
);

router.put(
  "/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateCourse
);

router.delete("/:id", verifyAdmin, deleteCourse);

module.exports = router;
