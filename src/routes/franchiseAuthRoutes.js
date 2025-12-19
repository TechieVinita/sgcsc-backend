const express = require("express");
const router = express.Router();
const Franchise = require("../models/Franchise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * POST /api/franchise-auth/login
 * Login using USERNAME + PASSWORD
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required",
      });
    }

    // 1️⃣ Find franchise by username
    const franchise = await Franchise.findOne({ username });

    if (!franchise) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 2️⃣ Check approval
    if (franchise.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Franchise not approved",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(
      password,
      franchise.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Create token
    const token = jwt.sign(
      {
        franchiseId: franchise._id,
        role: "franchise",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      role: "franchise",
    });
  } catch (err) {
    console.error("Franchise login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
