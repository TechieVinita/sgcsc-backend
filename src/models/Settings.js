// src/models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    socialLinks: {
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      twitter: {
        type: String,
        default: "",
        trim: true,
      },
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
    },
    creditPricing: {
      student: {
        type: Number,
        default: 10,
        min: 0,
      },
      course: {
        type: Number,
        default: 20,
        min: 0,
      },
      subject: {
        type: Number,
        default: 5,
        min: 0,
      },
      result: {
        type: Number,
        default: 15,
        min: 0,
      },
      certificate: {
        type: Number,
        default: 25,
        min: 0,
      },
    },
    creditTopupQR: {
      url: {
        type: String,
        default: "",
        trim: true,
      },
      publicId: {
        type: String,
        default: "",
        trim: true,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
    creditTopupInstructions: {
      type: String,
      default: "",
      trim: true,
    },
    certificateTemplateConfig: {
      typingCertificate: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          studentName: { x: 50, y: 40, font: "bold 120px serif", color: "#000000", align: "center" },
          fatherHusbandName: { x: 30, y: 52, font: "100px serif", color: "#000000", align: "left" },
          motherName: { x: 70, y: 52, font: "100px serif", color: "#000000", align: "left" },
          enrollmentNumber: { x: 30, y: 60, font: "100px serif", color: "#000000", align: "left" },
          computerTyping: { x: 70, y: 60, font: "100px serif", color: "#000000", align: "left" },
          certificateNo: { x: 50, y: 68, font: "bold 100px serif", color: "#000000", align: "center" },
          dateOfIssue: { x: 50, y: 76, font: "100px serif", color: "#000000", align: "center" },
        },
      },
      franchiseCertificate: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          studentName: { x: 50, y: 35, font: "bold 100px serif", color: "#000000", align: "center" },
          fatherName: { x: 50, y: 45, font: "80px serif", color: "#000000", align: "center" },
          courseName: { x: 50, y: 55, font: "80px serif", color: "#000000", align: "center" },
          session: { x: 50, y: 63, font: "80px serif", color: "#000000", align: "center" },
          grade: { x: 50, y: 71, font: "80px serif", color: "#000000", align: "center" },
          enrollmentNumber: { x: 30, y: 80, font: "60px serif", color: "#000000", align: "left" },
          certificateNumber: { x: 70, y: 80, font: "60px serif", color: "#000000", align: "left" },
          issueDate: { x: 50, y: 88, font: "60px serif", color: "#000000", align: "center" },
        },
      },
      marksheet: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          enrollmentNo: { x: 30, y: 15, font: "bold 60px serif", color: "#000000", align: "left" },
          rollNumber: { x: 73, y: 28.5, font: "bold 60px serif", color: "#000000", align: "left" },
          studentName: { x: 30, y: 25.5, font: "bold 60px serif", color: "#000000", align: "left" },
          fatherName: { x: 30, y: 28.4, font: "60px serif", color: "#000000", align: "left" },
          motherName: { x: 30, y: 31.3, font: "60px serif", color: "#000000", align: "left" },
          dob: { x: 73, y: 31.2, font: "60px serif", color: "#000000", align: "left" },
          courseName: { x: 30, y: 37, font: "60px serif", color: "#000000", align: "left" },
          courseDuration: { x: 73, y: 25.5, font: "60px serif", color: "#000000", align: "left" },
          coursePeriodFrom: { x: 30, y: 34, font: "60px serif", color: "#000000", align: "left" },
        coursePeriodTo: { x: 49, y: 34, font: "60px serif", color: "#000000", align: "left" },
          instituteName: { x: 30, y: 39.8, font: "60px serif", color: "#000000", align: "left" },
          subjectsStartY: 48,
          subjectRowHeight: 15,
        },
      },
    },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
