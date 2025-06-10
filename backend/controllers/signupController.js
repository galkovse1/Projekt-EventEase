const EventSignup = require('../models/EventSignup');
const Event = require('../models/Event');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendSignupConfirmation, sendCancellationConfirmation } = require('../utils/emailService');

const signupToEvent = async (req, res) => {
    const { eventId } = req.params;
    const { name, surname, age, userId, email } = req.body;

    // Pridobi dogodek z možnimi datumi
    const event = await Event.findByPk(eventId, {
        include: [{ model: require('../models/EventDateOption'), as: 'dateOptions' }]
    });
    if (!event || !event.allowSignup) {
        return res.status(403).json({ error: 'Prijava ni dovoljena' });
    }

    if (event.maxSignups) {
        const prijavljenih = await EventSignup.count({ where: { eventId } });
        if (prijavljenih >= event.maxSignups) {
            return res.status(403).json({ error: 'Doseženo maksimalno število prijav' });
        }
    }

    if (userId) {
        const obstaja = await EventSignup.findOne({ where: { eventId, userId } });
        if (obstaja) {
            return res.status(409).json({ error: 'Uporabnik je že prijavljen na ta dogodek' });
        }
    }

    // 📬 Pridobi email – obvezno
    let fixedEmail = email?.trim();
    if (!fixedEmail && userId) {
        const user = await User.findByPk(userId);
        if (user?.email) {
            fixedEmail = user.email;
            console.log(`📬 Email pridobljen iz baze: ${fixedEmail}`);
        }
    }

    // ⛔ Če ni emaila, zavrni prijavo
    if (!fixedEmail) {
        return res.status(400).json({ error: 'Manjka e-poštni naslov' });
    }

    const obstajaEmail = await EventSignup.findOne({ where: { eventId, email: fixedEmail } });
    if (obstajaEmail) {
        return res.status(409).json({ error: 'Ta email je že prijavljen na ta dogodek' });
    }

    const newSignup = await EventSignup.create({
        eventId,
        name,
        surname,
        age,
        userId,
        email: fixedEmail
    });

    // Pošlji potrditveni email
    try {
        await sendSignupConfirmation(fixedEmail, event);
        console.log(`📧 Potrditveni email poslan na: ${fixedEmail}`);
    } catch (err) {
        console.error('❌ Napaka pri pošiljanju potrditvenega emaila:', err);
        // Ne vračamo napake, ker je prijava uspela
    }

    res.status(201).json(newSignup);
};


const getEventSignups = async (req, res) => {
    const { eventId } = req.params;
    const signups = await EventSignup.findAll({
        where: { eventId },
        attributes: ['id', 'name', 'surname', 'age', 'userId', 'email']
    });
    res.json(signups);
};

const cancelSignup = async (req, res) => {
    const { eventId, userId } = req.params;
    const prijava = await EventSignup.findOne({ where: { eventId, userId } });
    if (!prijava) {
        return res.status(404).json({ error: 'Prijava ni najdena' });
    }

    // Pridobi podatke o dogodku in uporabniku pred brisanjem prijave
    const event = await Event.findByPk(eventId);
    const user = await User.findByPk(userId);
    const email = prijava.email || (user ? user.email : null);

    await prijava.destroy();

    // Pošlji potrditveni email o odjavi
    if (email && event) {
        try {
            await sendCancellationConfirmation(email, event);
            console.log(`📧 Potrditveni email o odjavi poslan na: ${email}`);
        } catch (err) {
            console.error('❌ Napaka pri pošiljanju potrditvenega emaila o odjavi:', err);
            // Ne vračamo napake, ker je odjava uspela
        }
    }

    res.status(204).send();
};

const getUserSignups = async (req, res) => {
    const { userId } = req.params;

    try {
        const signups = await EventSignup.findAll({
            where: { userId },
            attributes: ['eventId']
        });

        const eventIds = signups.map(signup => signup.eventId);
        res.json(eventIds);
    } catch (error) {
        console.error('Napaka pri pridobivanju prijav uporabnika:', error);
        res.status(500).json({ error: 'Napaka pri pridobivanju prijav' });
    }
};

module.exports = {
    signupToEvent,
    getEventSignups,
    cancelSignup,
    getUserSignups
};