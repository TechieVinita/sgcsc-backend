// server/src/middleware/fileFilter.js
const allowedImage = /\.(jpg|jpeg|png|webp|gif)$/i;
module.exports.imageFilter = (req, file, cb) => {
  const ok = allowedImage.test(file.originalname);
  if (!ok) return cb(new Error('Only image files allowed'));
  if (file.size && file.size > 300 * 1024) return cb(new Error('File too large'));
  cb(null, true);
};
