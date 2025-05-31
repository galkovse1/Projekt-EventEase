const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getVisibleEvents,
  createDateOptions,
  voteForDate,
  setFinalDate
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

router.post('/:id/date-options', createDateOptions); // organizator doda možnosti
router.post('/vote/:dateOptionId', voteForDate);     // uporabnik glasuje
router.post('/:eventId/final-date/:dateOptionId', setFinalDate); // organizator izbere končni datum

module.exports = router;