const express = require("express");
const router = express.Router();
const { verifyFranchisePublic } = require("../controllers/franchiseController");
const { listApprovedFranchises } = require("../controllers/franchiseController");

// PUBLIC franchise verification
router.get("/verify", verifyFranchisePublic);
router.get("/", listApprovedFranchises);

module.exports = router;
