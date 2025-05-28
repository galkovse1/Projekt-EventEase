const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getVisibleEvents
} = require('../controllers/eventController');
const checkJwt = require('../middleware/auth');

// Public & protected
router.get('/visible', checkJwt, getVisibleEvents); // MORA biti pred :id
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(checkJwt);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
