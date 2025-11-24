// src/controllers/uploadController.js
const path = require('path');
const fs = require('fs');

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // multer has already written file to disk (if using diskStorage).
    // If using memoryStorage you would need to write the buffer to disk here.

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (err) {
    next(err);
  }
};
