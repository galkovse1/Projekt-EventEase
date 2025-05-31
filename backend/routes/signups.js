const express = require('express');
const router = express.Router();
const { signupToEvent, getEventSignups, cancelSignup, getUserSignups } = require('../controllers/signupController');

router.get('/user/:userId', getUserSignups); // ⬅️ Nova pot
router.post('/:eventId', signupToEvent);         // POST /api/signups/:eventId
router.get('/:eventId', getEventSignups);        // GET /api/signups/:eventId
router.delete('/:eventId/:userId', cancelSignup);  // DELETE /api/signups/:eventId/:userId

module.exports = router;