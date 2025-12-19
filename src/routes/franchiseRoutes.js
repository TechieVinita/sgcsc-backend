const express = require("express");
const router = express.Router();

const {
  createFranchise,
  createFranchisePublic,
  getFranchises,
  updateFranchise,
  deleteFranchise,
} = require("../controllers/franchiseController");

// const { verifyAdmin } = require("../middleware/authMiddleware");
const franchiseUploads = require("../middleware/franchiseUploads");

// ✅ PUBLIC ROUTE
router.post(
  "/public/register",
  franchiseUploads,
  createFranchisePublic
);

// 🔒 ADMIN ROUTES
// 🔒 ADMIN ROUTES (TEMPORARILY UNPROTECTED)
router.post("/", franchiseUploads, createFranchise);
router.get("/", getFranchises);
router.put("/:id", updateFranchise);

router.delete("/:id", deleteFranchise);


module.exports = router;
