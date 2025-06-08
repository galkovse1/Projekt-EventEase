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
const { Op, Sequelize } = require('sequelize');
const { Event } = require('../models/Event');
const { EventSignup } = require('../models/EventSignup');

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

// GET /api/events/featured
router.get('/featured', async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    const upcoming = await Event.findAll({
      where: {
        visibility: 'public',
        dateTime: {
          [Op.between]: [now, threeDaysLater]
        }
      },
      order: Sequelize.literal('RAND()'),
      limit: 1
    });

    if (upcoming.length === 0) {
      return res.status(404).json({ message: 'Ni izpostavljenih dogodkov.' });
    }

    const event = upcoming[0];

    const signups = await EventSignup.count({
      where: { eventId: event.id }
    });

    const freeSpots = event.maxSignups - signups;

    res.json({
      ...event.toJSON(),
      freeSpots
    });
  } catch (err) {
    console.error('Napaka pri pridobivanju izpostavljenega dogodka:', err);
    res.status(500).json({ error: 'Napaka na strežniku' });
  }
});

module.exports = router;