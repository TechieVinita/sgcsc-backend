// server/src/routes/studyMaterialRoutes.js
const express = require('express');
const multer = require('multer');

const verifyAdmin = require('../middleware/authMiddleware');
const controller = require('../controllers/studyMaterialController');

const {
  createMaterial,
  listMaterials,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
} = controller;

const router = express.Router();

/* ===================== MULTER ===================== */
const upload = multer({
  dest: 'src/uploads',
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ===================== ROUTES ===================== */
// Base path: /api/study-materials

router.get('/', listMaterials);

router.post(
  '/',
  verifyAdmin,
  upload.single('file'),
  createMaterial
);

router.put(
  '/:id',
  verifyAdmin,
  upload.single('file'),
  updateMaterial
);

router.delete('/:id', verifyAdmin, deleteMaterial);

router.get('/:id/download', downloadMaterial);

module.exports = router;
