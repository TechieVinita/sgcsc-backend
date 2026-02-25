const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sgcsc/franchises",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panImage", maxCount: 1 },
  { name: "institutePhoto", maxCount: 1 },
  { name: "ownerSign", maxCount: 1 },
  { name: "ownerImage", maxCount: 1 },
  { name: "certificateFile", maxCount: 1 }, // remove if not image
]);
