const express = require("express");
const router = express.Router();

const {
  verifyEnrollment,
  verifyResult,
  verifyCertificate,
} = require("../controllers/publicVerificationController");

router.post("/enrollment", verifyEnrollment);
router.post("/result", verifyResult);
router.post("/certificate", verifyCertificate);

module.exports = router;
