// server/src/routes/memberRoutes.js
const express = require("express");
const router = express.Router();

const Member = require("../models/Member");
const verifyAdmin = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/upload");

/* ===========================
   PUBLIC ROUTES
=========================== */

router.get("/", async (_req, res, next) => {
  try {
    const members = await Member.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
});

/* ===========================
   ADMIN ROUTES
=========================== */

router.post(
  "/",
  verifyAdmin,
  uploadImage.single("photo"),
  async (req, res, next) => {
    try {
      console.log("UPLOAD FILE:", req.file?.path);

      const { name, designation, isActive, order } = req.body;

      if (!name?.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Name is required" });
      }

      const member = await Member.create({
        name: name.trim(),
        designation: (designation || "").trim(),
        isActive: isActive !== "false",
        order: Number(order) || 0,
        photoUrl: req.file?.path || "",
      });

      res.status(201).json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  verifyAdmin,
  uploadImage.single("photo"),
  async (req, res, next) => {
    try {
      const update = {};

      if (req.body.name) update.name = req.body.name.trim();
      if (req.body.designation)
        update.designation = req.body.designation.trim();
      if (req.body.isActive !== undefined)
        update.isActive = req.body.isActive !== "false";
      if (req.body.order !== undefined)
        update.order = Number(req.body.order) || 0;

      if (req.file?.path) update.photoUrl = req.file.path;

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

      res.json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", verifyAdmin, async (req, res, next) => {
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
