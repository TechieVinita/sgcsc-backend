// server/src/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

/**
 * Base path: /api/subjects
 */

// List / filter subjects
router.get('/', getSubjects);

// Single subject
router.get('/:id', getSubject);

// Admin-only create/update/delete
router.post('/', verifyAdmin, createSubject);
router.put('/:id', verifyAdmin, updateSubject);
router.delete('/:id', verifyAdmin, deleteSubject);

module.exports = router;
