const express = require('express');
const router = express.Router();
const { signupToEvent, getEventSignups } = require('../controllers/signupController');

router.post('/:eventId', signupToEvent);         // POST /api/signups/:eventId
router.get('/:eventId', getEventSignups);        // GET /api/signups/:eventId

module.exports = router;