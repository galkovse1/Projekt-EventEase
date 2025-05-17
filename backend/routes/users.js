const express = require('express');
const router = express.Router();
const { createUser, getProfile } = require('../controllers/userController');

router.post('/', createUser);               // POST /api/users
router.get('/:id', getProfile);             // GET /api/users/:id

module.exports = router;