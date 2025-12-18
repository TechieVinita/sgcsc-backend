const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* ---------- ASSIGNMENTS (PDF, DOC, etc) ---------- */
const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sgcsc/assignments",
    resource_type: "raw", // IMPORTANT
  },
});

const assignmentUpload = multer({ storage: assignmentStorage });

module.exports = {
  uploadImage: multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "sgcsc/images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    }),
  }),
  uploadAssignment: assignmentUpload,
};
