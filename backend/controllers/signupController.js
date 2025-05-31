const EventSignup = require('../models/EventSignup');
const Event = require('../models/Event');
const { Op } = require('sequelize');

const signupToEvent = async (req, res) => {
    const { eventId } = req.params;
    const { name, surname, age, userId } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event || !event.allowSignup) {
        return res.status(403).json({ error: 'Prijava ni dovoljena' });
    }

    // Preveri maxSignups
    if (event.maxSignups) {
        const prijavljenih = await EventSignup.count({ where: { eventId } });
        if (prijavljenih >= event.maxSignups) {
            return res.status(403).json({ error: 'Doseženo maksimalno število prijav' });
        }
    }

    // Prepreči večkratno prijavo istega userja (če je userId podan)
    if (userId) {
        const obstaja = await EventSignup.findOne({ where: { eventId, userId } });
        if (obstaja) {
            return res.status(409).json({ error: 'Uporabnik je že prijavljen na ta dogodek' });
        }
    }

    const newSignup = await EventSignup.create({ eventId, name, surname, age, userId });
    res.status(201).json(newSignup);
};

const getEventSignups = async (req, res) => {
    const { eventId } = req.params;
    const signups = await EventSignup.findAll({ where: { eventId }, attributes: ['id', 'name', 'surname', 'age', 'userId'] });
    res.json(signups);
};

const cancelSignup = async (req, res) => {
    const { eventId, userId } = req.params;
    const prijava = await EventSignup.findOne({ where: { eventId, userId } });
    if (!prijava) {
        return res.status(404).json({ error: 'Prijava ni najdena' });
    }
    await prijava.destroy();
    res.status(204).send();
};

const getUserSignups = async (req, res) => {
    const { userId } = req.params;

    try {
        const signups = await EventSignup.findAll({
            where: { userId },
            attributes: ['eventId'] // samo eventId, nič osebnega
        });

        const eventIds = signups.map(signup => signup.eventId);
        res.json(eventIds);
    } catch (error) {
        console.error('Napaka pri pridobivanju prijav uporabnika:', error);
        res.status(500).json({ error: 'Napaka pri pridobivanju prijav' });
    }
};

module.exports = { signupToEvent, getEventSignups, cancelSignup, getUserSignups };