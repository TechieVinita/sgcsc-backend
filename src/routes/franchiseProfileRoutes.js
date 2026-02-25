const express = require("express");
const router = express.Router();
const franchiseAuth = require("../middleware/franchiseAuthMiddleware");

router.get("/me", franchiseAuth, async (req, res) => {
  res.json({
    success: true,
    data: req.franchise,
  });
});

module.exports = router;
