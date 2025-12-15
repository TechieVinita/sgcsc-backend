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

router.get('/', getSubjects);
router.get('/:id', getSubject);

router.post('/', verifyAdmin, createSubject);
router.put('/:id', verifyAdmin, updateSubject);
router.delete('/:id', verifyAdmin, deleteSubject);

module.exports = router;
