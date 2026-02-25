const express = require("express");
const router = express.Router();

const {
  createFranchise,
  createFranchisePublic,
  getFranchises,
  updateFranchise,
  deleteFranchise,
  checkUsernameUnique,
} = require("../controllers/franchiseController");

const franchiseUploads = require("../middleware/franchiseUploads");

// ✅ PUBLIC ROUTE
router.post(
  "/public/register",
  franchiseUploads,
  createFranchisePublic
);

// 🔍 USERNAME CHECK (MISSING EARLIER)
router.get("/check-username", checkUsernameUnique);

// 🔒 ADMIN ROUTES (TEMP)
router.post("/", franchiseUploads, createFranchise);
router.get("/", getFranchises);
router.put("/:id", updateFranchise);
router.delete("/:id", deleteFranchise);

module.exports = router;
