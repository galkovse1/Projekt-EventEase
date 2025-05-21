const Event = require('../models/Event');
const User = require('../models/User');

const getAllEvents = async (req, res) => {
  const events = await Event.findAll({
    include: { model: User, as: 'User', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] },
    order: [['dateTime', 'ASC']]
  });
  res.json(events);
};

const getEventById = async (req, res) => {
  const event = await Event.findByPk(req.params.id, {
    include: { model: User, as: 'User', attributes: ['auth0Id', 'name', 'surname', 'email', 'picture'] }
  });
  if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
  res.json(event);
};

const createEvent = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { name, email, picture } = req.auth.payload;
    console.log('Auth0 payload:', req.auth.payload);
    // Preveri ali uporabnik obstaja, če ne ga ustvari
    let user = await User.findByPk(auth0Id);
    if (!user) {
      user = await User.create({
        auth0Id,
        name: name || '',
        email: email || '',
        picture: picture || ''
      });
    }
    const { title, description, dateTime, location, imageUrl, allowSignup } = req.body;
    const newEvent = await Event.create({
      title,
      description,
      dateTime,
      location,
      imageUrl,
      allowSignup,
      ownerId: auth0Id
    });
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Napaka pri ustvarjanju dogodka:', err);
    res.status(500).json({ error: 'Napaka pri ustvarjanju dogodka' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
    if (event.ownerId !== auth0Id) return res.status(403).json({ error: 'Nimate dovoljenja za urejanje tega dogodka' });
    const { title, description, dateTime, location, imageUrl, allowSignup } = req.body;
    await event.update({
      title,
      description,
      dateTime,
      location,
      imageUrl,
      allowSignup
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

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
