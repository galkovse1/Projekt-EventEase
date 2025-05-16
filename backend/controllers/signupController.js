const EventSignup = require('../models/EventSignup');
const Event = require('../models/Event');

const signupToEvent = async (req, res) => {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event || !event.allowSignup) {
        return res.status(403).json({ error: 'Prijava ni dovoljena' });
    }

    const newSignup = await EventSignup.create({ eventId, userId });
    res.status(201).json(newSignup);
};

const getEventSignups = async (req, res) => {
    const { eventId } = req.params;
    const signups = await EventSignup.findAll({ where: { eventId } });
    res.json(signups);
};

module.exports = { signupToEvent, getEventSignups };