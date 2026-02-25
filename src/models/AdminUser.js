// server/src/models/AdminUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },


    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔒 never return password unless explicitly requested
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "editor", "viewer"],
      default: "admin",
    },

    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password ONCE
adminUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
adminUserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("AdminUser", adminUserSchema);
