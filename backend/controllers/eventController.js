const Event = require('../models/Event');
const User = require('../models/User');

const getAllEvents = async (req, res) => {
  const events = await Event.findAll({
    include: { model: User, attributes: ['id', 'username'] },
    order: [['dateTime', 'ASC']]
  });
  res.json(events);
};

const getEventById = async (req, res) => {
  const event = await Event.findByPk(req.params.id, {
    include: { model: User, attributes: ['username'] }
  });
  if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });
  res.json(event);
};

const createEvent = async (req, res) => {
  const { title, description, dateTime, location, imageUrl, allowSignup, ownerId } = req.body;
  const newEvent = await Event.create({ title, description, dateTime, location, imageUrl, allowSignup, ownerId });
  res.status(201).json(newEvent);
};

const updateEvent = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });

  await event.update(req.body);
  res.json(event);
};

const deleteEvent = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Dogodek ne obstaja' });

  await event.destroy();
  res.json({ message: 'Dogodek izbrisan' });
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
