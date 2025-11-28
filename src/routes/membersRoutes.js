// server/src/routes/memberRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');

// PUBLIC: list members (for website)
router.get('/', getMembers);

// ADMIN: create / update / delete members
router.post('/', verifyAdmin, createMember);
router.put('/:id', verifyAdmin, updateMember);
router.delete('/:id', verifyAdmin, deleteMember);

module.exports = router;
