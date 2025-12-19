const express = require("express");
const router = express.Router();
const Franchise = require("../models/Franchise");
const franchiseAuth = require("../middleware/franchiseAuth");

/* =========================================================
   GET LOGGED-IN FRANCHISE PROFILE
   ========================================================= */
router.get("/me", franchiseAuth, async (req, res) => {
  res.json({
    success: true,
    data: req.franchise,
  });
});

/* =========================================================
   UPDATE LOGGED-IN FRANCHISE PROFILE
   ========================================================= */
router.put("/me", franchiseAuth, async (req, res) => {
  const allowedFields = [
    "contact",
    "whatsapp",
    "address",
    "district",
    "state",
    "totalComputers",
    "classRooms",
    "operatorsCount",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.franchise[field] = req.body[field];
    }
  });

  await req.franchise.save();

  res.json({
    success: true,
    data: req.franchise,
  });
});

module.exports = router;
