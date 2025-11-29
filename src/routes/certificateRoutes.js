// server/src/routes/certificateRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const certificateController = require('../controllers/certificateController');

// All routes are admin-only
router.post('/', verifyAdmin, certificateController.createCertificate);
router.get('/', verifyAdmin, certificateController.getCertificates);
router.get('/:id', verifyAdmin, certificateController.getCertificateById);
router.put('/:id', verifyAdmin, certificateController.updateCertificate);
router.delete('/:id', verifyAdmin, certificateController.deleteCertificate);

module.exports = router;
