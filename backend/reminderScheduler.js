const { Op } = require('sequelize');
const Event = require('./models/Event');
const EventSignup = require('./models/EventSignup');
const User = require('./models/User');
const { sendReminderEmail } = require('./utils/emailService');

// Kliče se vsako minuto
const runReminderJob = async () => {
    const now = new Date();

    const targetTime = new Date(now.getTime() + 60 * 1000); // 1 minuta vnaprej

    // 24 ur vnaprej (točno en dan)
    //const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const from = new Date(targetTime.getTime() - 30 * 1000);
    const to = new Date(targetTime.getTime() + 30 * 1000);

    //console.log('🔍 Iskanje dogodkov, ki se začnejo med', from.toISOString(), 'in', to.toISOString());

    const events = await Event.findAll({
        where: {
            dateTime: { [Op.between]: [from, to] },
            reminderSent: false
        }
    });

    for (const event of events) {
        console.log(`📅 Dogodek za opomnik: ${event.title}`);

        const signups = await EventSignup.findAll({
            where: {
                eventId: event.id,
                email: { [Op.not]: null }
            },
            include: {
                model: User,
                as: 'User',
                attributes: ['wantsNotifications']
            }
        });

        for (const signup of signups) {
            if (signup.User?.wantsNotifications) {
                const to = signup.email;
                console.log(`📨 Pošiljam opomnik na: ${to}`);
                try {
                    await sendReminderEmail(to, event);
                } catch (err) {
                    console.error('❌ Napaka pri pošiljanju:', err);
                }
            } else {
                console.log(`⚠️ Uporabnik ne želi opomnikov: ${signup.email}`);
            }
        }

        event.reminderSent = true;
        await event.save();
    }
};

module.exports = runReminderJob;