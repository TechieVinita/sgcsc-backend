const express = require("express");
const router = express.Router();
const Franchise = require("../models/Franchise");
const authUser = require("../middleware/authUser");

router.get("/me", authUser, async (req, res) => {
  if (req.userRole !== "franchise") {
    return res.status(403).json({ message: "Access denied" });
  }

  const franchise = await Franchise.findById(req.userId).select("-passwordHash");

  if (!franchise) {
    return res.status(404).json({ message: "Franchise not found" });
  }

  res.json(franchise);
});

module.exports = router;
