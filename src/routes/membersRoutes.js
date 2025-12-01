// src/routes/membersRoutes.js
const express = require("express");

let Member;

// Try common locations for the Member model
try {
  Member = require("../models/Model"); // what you said you use
} catch (e1) {
  try {
    Member = require("../models/memberModel");
  } catch (e2) {
    console.error("[MEMBERS ROUTE] Failed to load Member model:", e1.message);
    console.error("[MEMBERS ROUTE] Second attempt:", e2.message);
    throw new Error(
      "Member model not found. Make sure src/models/Model.js (or memberModel.js) exists and exports a Mongoose model."
    );
  }
}

const router = express.Router();

/**
 * GET /api/members
 * List all members, sorted by order ASC then createdAt DESC
 */
router.get("/", async (_req, res, next) => {
  try {
    const members = await Member.find().sort({ order: 1, createdAt: -1 });
    // Plain array response – works fine with API.unwrap
    res.json(members);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/members/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/members
 * Create new member – compatible with AddMember.jsx payload
 */
router.post("/", async (req, res, next) => {
  try {
    const { name, designation, isActive } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const member = new Member({
      name: name.trim(),
      designation: (designation || "").trim(),
      isActive: isActive !== false,
      // photoUrl & order should come from schema defaults if any
    });

    const saved = await member.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/members/:id
 * Update existing member – compatible with Members.jsx edit form
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { name, designation, isActive } = req.body;

    const update = {};
    if (typeof name === "string") update.name = name.trim();
    if (typeof designation === "string")
      update.designation = designation.trim();
    if (typeof isActive !== "undefined") update.isActive = !!isActive;

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    res.json(member);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/members/:id
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }
    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
