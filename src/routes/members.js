const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/authMiddleware');
const memberController = require('../controllers/memberController');

// public (used by Home page)
router.get('/', memberController.listMembers);

// admin
router.post('/', verifyAdmin, memberController.createMember);
router.put('/:id', verifyAdmin, memberController.updateMember);
router.delete('/:id', verifyAdmin, memberController.deleteMember);

module.exports = router;
