const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addContact, getContacts } = require('../controllers/contactController');

// Public route to submit message
router.post('/', addContact);

// Admin route to get all messages
router.get('/', auth, getContacts);

module.exports = router;
