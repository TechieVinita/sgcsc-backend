// server/src/routes/franchiseRoutes.js
const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/upload");
const {
  createFranchise,
  getFranchises,
  getFranchise,
  updateFranchise,
  deleteFranchise,
  checkUsernameUnique,
} = require("../controllers/franchiseController");

// Named Cloudinary fields
const franchiseUploads = uploadImage.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panImage", maxCount: 1 },
  { name: "institutePhoto", maxCount: 1 },
  { name: "ownerSign", maxCount: 1 },
  { name: "ownerImage", maxCount: 1 },
  { name: "certificateFile", maxCount: 1 },
]);

// IMPORTANT: before /:id
router.get("/check-username", checkUsernameUnique);

// Admin routes
router.get("/", verifyAdmin, getFranchises);
router.get("/:id", verifyAdmin, getFranchise);

router.post(
  "/",
  verifyAdmin,
  franchiseUploads,
  createFranchise
);

router.put(
  "/:id",
  verifyAdmin,
  franchiseUploads,
  updateFranchise
);

router.delete("/:id", verifyAdmin, deleteFranchise);

module.exports = router;
