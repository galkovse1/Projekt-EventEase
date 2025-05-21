const express = require('express');
const router = express.Router();
const {
  getAllEvents, getEventById,
  createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const checkJwt = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);              // GET /api/events
router.get('/:id', getEventById);           // GET /api/events/:id

// Protected routes
router.use(checkJwt);
router.post('/', createEvent);              // POST /api/events
router.put('/:id', updateEvent);            // PUT /api/events/:id
router.delete('/:id', deleteEvent);         // DELETE /api/events/:id

module.exports = router;
