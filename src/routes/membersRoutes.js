// server/src/routes/membersRoutes.js
const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

/**
 * GET /api/members
 * List all members
 */
router.get("/", async (_req, res, next) => {
  try {
    const members = await Member.find().sort({
      order: 1,
      createdAt: -1,
    });
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
 */
router.post("/", async (req, res, next) => {
  try {
    const { name, designation, isActive } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const member = await Member.create({
      name: name.trim(),
      designation: (designation || "").trim(),
      isActive: isActive !== false,
    });

    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/members/:id
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
      update,
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
