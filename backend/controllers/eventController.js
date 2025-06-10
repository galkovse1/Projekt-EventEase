const { sendReminderEmail, sendInviteNotification } = require('../utils/emailService');
const { Op, Sequelize } = require('sequelize');
const Event = require('../models/Event');
const User = require('../models/User');
const EventVisibility = require('../models/EventVisibility');
const { sendCreationConfirmation } = require('../utils/emailService');
const EventDateOption = require('../models/EventDateOption');
const DateVote = require('../models/DateVote');
const axios = require('axios');


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
        { model: User, as: 'User', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] },
        { model: User, as: 'VisibleToUsers', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] },
        {
          model: EventDateOption,
          as: 'dateOptions',
          attributes: ['id', 'dateOption', 'isFinal'],
          include: [{
            model: DateVote,
            as: 'votes',
            attributes: ['userId'] // dovolj je userId za preverjanje, če je uporabnik že glasoval
          }]
        }
      ]
    });
    if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Napaka pri pridobivanju dogodka' });
  }
};

const createEvent = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    let { name, email, picture } = req.auth.payload;


    if (!email) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const userinfoRes = await axios.get('https://dev-r12pt12nxl2304iz.us.auth0.com/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const info = userinfoRes.data;
        name = info.name;
        email = info.email;
        picture = info.picture;
        console.log(`✅ Email pridobljen iz /userinfo: ${email}`);
      } catch (err) {
        console.warn('⚠️ Neuspešen klic /userinfo:', err.response?.data || err.message);
      }
    }

    let user = await User.findByPk(auth0Id);
    if (!user) {
      user = await User.create({
        auth0Id,
        name: name || '',
        email: email || '',
        picture: picture || '',
        wantsNotifications: true
      });
    } else if (!user.email && email) {
      user.email = email;
      await user.save();
      console.log(`📬 Email shranjen za uporabnika ${auth0Id}: ${email}`);
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
      visibleTo = [],
      signupDeadline
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
      ownerId: auth0Id,
      ...(signupDeadline && signupDeadline !== 'Invalid date' ? { signupDeadline } : {}) // 🛡️ zaščita
    });

    // Shrani EventVisibility (če je treba)
    if (visibility === 'selected' && Array.isArray(visibleTo)) {
      const records = visibleTo.map(userId => ({
        EventId: newEvent.id,
        UserId: userId
      }));
      await EventVisibility.bulkCreate(records);

// ponovno naloži dogodek z vsemi podatki (da bo imel tudi signupDeadline)
      const eventWithDeadline = await Event.findByPk(newEvent.id);

// pošlji email za vsakega
      const invitedUsers = await User.findAll({
        where: { auth0Id: visibleTo },
        attributes: ['email', 'name', 'wantsNotifications']
      });

      for (const u of invitedUsers) {
        if (u.email && u.wantsNotifications) {
          try {
            console.log("📬 Email se pošilja z signupDeadline:", eventWithDeadline.signupDeadline);
            await sendInviteNotification(u.email, u.name, eventWithDeadline);
            console.log(`📨 Obvestilo poslano na: ${u.email}`);
          } catch (err) {
            console.error(`❌ Napaka pri pošiljanju povabila:`, err);
          }
        }
      }
    }

// ✅ Pošlji potrditveni email ustvarjalcu dogodka – vedno (če ima email)
    if (user.email) {
      console.log(`📧 Pošiljam potrditveni email na ${user.email} ...`);
      try {
        await sendCreationConfirmation(user.email, newEvent);
        console.log(`✅ Email poslan.`);
      } catch (emailErr) {
        console.error(`❌ Napaka pri pošiljanju potrditve:`, emailErr);
      }
    } else {
      console.warn(`⚠️ Uporabnik nima e-pošte: ${user.auth0Id}`);
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

    const { title, description, dateTime, location, imageUrl, allowSignup, maxSignups, visibility, visibleTo, signupDeadline } = req.body;

    await event.update({
      title,
      description,
      dateTime,
      location,
      imageUrl,
      allowSignup,
      maxSignups,
      visibility,
      signupDeadline
    });

    // Posodobi EventVisibility
    if (visibility === 'selected' && Array.isArray(visibleTo)) {
      await EventVisibility.destroy({ where: { EventId: event.id } });
      const records = visibleTo.map(userId => ({ EventId: event.id, UserId: userId }));
      await EventVisibility.bulkCreate(records);
    } else if (visibility !== 'selected') {
      await EventVisibility.destroy({ where: { EventId: event.id } });
    }

    // Vrni posodobljen dogodek z uporabniki
    const updated = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'User', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] },
        { model: User, as: 'VisibleToUsers', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] },
        { model: EventDateOption, as: 'dateOptions', attributes: ['id', 'dateOption', 'isFinal'] }
      ]
    });
    // ⏩ Pošlji obvestila samo novo dodanim uporabnikom (če obstajajo)
    if (visibility === 'selected' && Array.isArray(req.body.newlyAddedUsers)) {
      const eventWithDetails = await Event.findByPk(event.id); // pridobi vse podatke

      const newUsers = await User.findAll({
        where: { auth0Id: req.body.newlyAddedUsers },
        attributes: ['email', 'name', 'wantsNotifications']
      });

      for (const u of newUsers) {
        if (u.email && u.wantsNotifications) {
          try {
            await sendInviteNotification(u.email, u.name, eventWithDetails);
            console.log(`📨 Obvestilo poslano novemu: ${u.email}`);
          } catch (err) {
            console.error(`❌ Napaka pri pošiljanju obvestila novemu:`, err);
          }
        }
      }
    }

    res.json(updated);
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
      filters.push({
        [Op.or]: [
          { '$User.name$': { [Op.like]: `%${organizer}%` } },
          { '$User.surname$': { [Op.like]: `%${organizer}%` } }
        ]
      });
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
                SELECT 1 FROM "EventVisibilities"
                WHERE "EventVisibilities"."EventId" = "Event"."id"
                AND "EventVisibilities"."UserId" = '${auth0Id}'
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
        },
        {
          model: EventDateOption,
          as: 'dateOptions',
          attributes: ['id', 'dateOption', 'isFinal']
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

// Brisanje glasu za termin
const deleteVoteForDate = async (req, res) => {
  const userId = req.auth.payload.sub;
  const { dateOptionId } = req.params;

  const existingVote = await DateVote.findOne({ where: { userId, dateOptionId } });
  if (!existingVote) return res.status(404).json({ error: 'Glas ni najden' });

  await existingVote.destroy();
  res.json({ message: 'Glas izbrisan' });
};

// Dodaj uporabnika med izbrane za dogodek (invite link)
const addUserToEventVisibility = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
    if (event.visibility !== 'selected') return res.status(400).json({ error: 'Dogodek ni omejen na izbrane uporabnike' });

    // Preveri, če je uporabnik že med izbranimi
    const existing = await EventVisibility.findOne({ where: { EventId: eventId, UserId: auth0Id } });
    if (existing) return res.json({ message: 'Uporabnik je že med izbranimi' });

    await EventVisibility.create({ EventId: eventId, UserId: auth0Id });
    res.json({ message: 'Dodan med izbrane uporabnike' });
  } catch (err) {
    res.status(500).json({ error: 'Napaka pri dodajanju uporabnika med izbrane' });
  }
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
  setFinalDate,
  deleteVoteForDate,
  addUserToEventVisibility
};