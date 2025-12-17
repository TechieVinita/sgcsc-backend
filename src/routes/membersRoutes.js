const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =====================================================
   UPLOADS SETUP
===================================================== */

// Absolute path to /uploads
const uploadsDir = path.join(__dirname, "..", "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Optional file filter (images only)
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

/* =====================================================
   ROUTES
===================================================== */

/**
 * GET /api/members
 * List all members
 */
router.get("/", async (_req, res, next) => {
  try {
    const members = await Member.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

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
    const member = await Member.findById(req.params.id).lean();

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
 * Create member (with optional photo upload)
 */
router.post("/", upload.single("photo"), async (req, res, next) => {
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
      isActive: isActive !== "false",
      photoUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/members/:id
 * Update member (optionally replace photo)
 */
router.put("/:id", upload.single("photo"), async (req, res, next) => {
  try {
    const { name, designation, isActive } = req.body;

    const update = {};

    if (typeof name === "string") update.name = name.trim();
    if (typeof designation === "string")
      update.designation = designation.trim();
    if (typeof isActive !== "undefined")
      update.isActive = isActive !== "false";

    if (req.file) {
      update.photoUrl = `/uploads/${req.file.filename}`;
    }

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
