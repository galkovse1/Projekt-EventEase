const { Op, Sequelize } = require('sequelize');
const Event = require('../models/Event');
const User = require('../models/User');
const EventVisibility = require('../models/EventVisibility');
const { sendEventNotification } = require('../utils/emailService');
const EventDateOption = require('../models/EventDateOption');
const DateVote = require('../models/DateVote');

const getAllEvents = async (req, res) => {
  const events = await Event.findAll({
    include: { model: User, as: 'User', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] },
    order: [['dateTime', 'ASC']]
  });
  res.json(events);
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['auth0Id', 'name', 'surname', 'email', 'picture']
        },
        {
          model: EventDateOption,
          as: 'dateOptions', // TOČNO kot v associations.js
          include: [
            {
              model: DateVote,
              as: 'votes', // TOČNO kot v associations.js
              attributes: ['userId']
            }
          ]
        }
      ]
    });

    if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
    res.json(event);
  } catch (err) {
    console.error('Napaka v getEventById:', err);
    res.status(500).json({ error: 'Napaka pri pridobivanju dogodka' });
  }
};

const createEvent = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { name, email, picture } = req.auth.payload;

    // Poišči ali ustvari uporabnika
    let user = await User.findByPk(auth0Id);
    if (!user) {
      user = await User.create({
        auth0Id,
        name: name || '',
        email: email || '',
        picture: picture || '',
        wantsNotifications: false // privzeto
      });
    }

    const {
      title,
      description,
      dateTime,
      location,
      imageUrl,
      allowSignup,
      maxSignups,
      visibility = 'private',
      visibleTo = []
    } = req.body;

    // Ustvari dogodek
    const newEvent = await Event.create({
      title,
      description,
      dateTime,
      location,
      imageUrl,
      allowSignup,
      maxSignups,
      visibility,
      ownerId: auth0Id
    });

    // Če je vidnost izbrana, shrani, komu je dogodek viden
    if (visibility === 'selected' && Array.isArray(visibleTo)) {
      const records = visibleTo.map(userId => ({
        EventId: newEvent.id,
        UserId: userId
      }));
      await EventVisibility.bulkCreate(records);
    }

    // ✅ Pošlji email, če uporabnik želi obvestila
    if (user.wantsNotifications && user.email) {
      console.log(`📧 Pošiljam email na ${user.email} ...`);
      try {
        await sendEventNotification(user.email, newEvent);
        console.log(`✅ Email uspešno poslan.`);
      } catch (emailErr) {
        console.error(`❌ Napaka pri pošiljanju emaila:`, emailErr);
      }
    } else {
      console.log(`ℹ️ Uporabnik ne želi prejemati obvestil ali nima e-pošte.`);
    }

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('❌ Napaka pri ustvarjanju dogodka:', err);
    res.status(500).json({ error: 'Napaka pri ustvarjanju dogodka' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
    if (event.ownerId !== auth0Id) return res.status(403).json({ error: 'Nimate dovoljenja za urejanje tega dogodka' });

    const { title, description, dateTime, location, imageUrl, allowSignup, maxSignups, visibility } = req.body;

    await event.update({
      title,
      description,
      dateTime,
      location,
      imageUrl,
      allowSignup,
      maxSignups,
      visibility
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Napaka pri posodabljanju dogodka' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
    if (event.ownerId !== auth0Id) return res.status(403).json({ error: 'Nimate dovoljenja za brisanje tega dogodka' });

    await event.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Napaka pri brisanju dogodka' });
  }
};

const getVisibleEvents = async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub || null;
    const { search = '', location = '', date, organizer = '', onlyMine = false } = req.query;

    const filters = [];

    if (search) {
      filters.push({
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    if (location) {
      filters.push({ location: { [Op.like]: `%${location}%` } });
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filters.push({ dateTime: { [Op.between]: [start, end] } });
    }

    if (organizer) {
      filters.push(Sequelize.literal(`
        EXISTS (
          SELECT 1 FROM Users
          WHERE Users.auth0Id = Event.ownerId
          AND (Users.name LIKE '%${organizer}%' OR Users.surname LIKE '%${organizer}%')
        )
      `));
    }

    if (onlyMine === 'true' && auth0Id) {
      filters.push({ ownerId: auth0Id });
    }

    const visibilityCondition = auth0Id
        ? {
          [Op.or]: [
            { visibility: 'public' },
            { ownerId: auth0Id },
            Sequelize.literal(`
              EXISTS (
                SELECT 1 FROM EventVisibilities
                WHERE EventVisibilities.EventId = Event.id
                AND EventVisibilities.UserId = '${auth0Id}'
              )
            `)
          ]
        }
        : { visibility: 'public' };

    const events = await Event.findAll({
      where: {
        [Op.and]: [visibilityCondition, ...filters]
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['auth0Id', 'name', 'surname', 'email', 'picture']
        }
      ],
      order: [['dateTime', 'ASC']]
    });

    res.json(events);
  } catch (err) {
    console.error('Napaka pri pridobivanju dogodkov:', err);
    res.status(500).json({ error: 'Napaka pri pridobivanju dogodkov' });
  }
};

// Ustvari več datumskih možnosti
const createDateOptions = async (req, res) => {
  const { id } = req.params;
  const { dates } = req.body; // array of ISO date strings
  const event = await Event.findByPk(id);
  if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });

  const auth0Id = req.auth.payload.sub;
  if (event.ownerId !== auth0Id) return res.status(403).json({ error: 'Ni dovoljenja' });

  const options = dates.map(date => ({
    eventId: id,
    dateOption: date
  }));
  await EventDateOption.bulkCreate(options);
  res.status(201).json({ message: 'Datum možnosti shranjene' });
};

// Glasuj za termin
const voteForDate = async (req, res) => {
  const userId = req.auth.payload.sub;
  const { dateOptionId } = req.params;

  const existingVote = await DateVote.findOne({ where: { userId, dateOptionId } });
  if (existingVote) return res.status(400).json({ error: 'Že ste glasovali za ta datum' });

  await DateVote.create({ userId, dateOptionId });
  res.json({ message: 'Glas oddan' });
};

// Organizator izbere končni datum
const setFinalDate = async (req, res) => {
  const { eventId, dateOptionId } = req.params;
  const auth0Id = req.auth.payload.sub;

  const event = await Event.findByPk(eventId);
  if (!event || event.ownerId !== auth0Id)
    return res.status(403).json({ error: 'Ni dovoljenja' });

  // označi izbrani kot final
  await EventDateOption.update({ isFinal: false }, { where: { eventId } });
  await EventDateOption.update({ isFinal: true }, { where: { id: dateOptionId } });

  // shrani v glavni dogodek
  const selectedOption = await EventDateOption.findByPk(dateOptionId);
  event.dateTime = selectedOption.dateOption;
  await event.save();

  res.json({ message: 'Končni datum izbran' });
};


module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getVisibleEvents,
  createDateOptions,
  voteForDate,
  setFinalDate
};
