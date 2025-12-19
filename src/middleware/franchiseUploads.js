const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "institutePhoto", maxCount: 1 },
  { name: "ownerSign", maxCount: 1 },
  { name: "ownerImage", maxCount: 1 },
]);

