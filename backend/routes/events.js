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
const { upload, uploadImage } = require('../controllers/uploadController');
const optionalAuth = require('../middleware/optionalAuth');

// Public & protected
router.get('/visible', optionalAuth, getVisibleEvents);
router.get('/', getAllEvents);
router.get('/:id', optionalAuth, getEventById);

// Protected routes
router.use(checkJwt);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

router.post('/:id/date-options', createDateOptions); // organizator doda možnosti
router.post('/vote/:dateOptionId', voteForDate);     // uporabnik glasuje
router.post('/:eventId/final-date/:dateOptionId', setFinalDate); // organizator izbere končni datum
router.delete('/vote/:dateOptionId', require('../controllers/eventController').deleteVoteForDate);

router.post('/upload-image', upload.single('image'), uploadImage);

module.exports = router;