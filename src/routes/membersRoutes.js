// src/routes/membersRoutes.js
const express = require('express');
const router = express.Router();
const c = require('../controllers/memberController');
const verifyAdmin = require('../middleware/authMiddleware');

// Public
router.get('/', c.getMembers);

// Protected
router.post('/', verifyAdmin, c.createMember);
router.patch('/:id', verifyAdmin, c.updateMember);
router.delete('/:id', verifyAdmin, c.deleteMember);

module.exports = router;
