const nodemailer = require('nodemailer');
const { User } = require('../models/allModels');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendCreationConfirmation = async (to, event) => {
    // Najdi creatorja po njegovem auth0Id (ki je shranjen kot event.ownerId)
    const creator = await User.findByPk(event.ownerId);

    // Če uporabnik ne obstaja ali ne želi obvestil, prekini
    if (!creator || !creator.wantsNotifications) {
        console.log(`⏩ Uporabnik ${event.ownerId} ne želi prejeti potrditve dogodka.`);
        return;
    }

    // Pošlji potrdilo
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `Potrdilo o ustvarjanju dogodka: ${event.title}`,
        html: `
            <h2>Ustvarjen dogodek: ${event.title}</h2>
            <p><strong>Kdaj:</strong> ${new Date(event.dateTime).toLocaleString()}</p>
            <p><strong>Opis:</strong> ${event.description || 'Ni opisa.'}</p>
            <p><strong>Lokacija:</strong> ${event.location || 'Ni lokacije.'}</p>
            <br/>
            <a href="${process.env.FRONTEND_BASE_URL}/events/${event.id}">Klikni za ogled dogodka</a>
        `
    });
};

const sendReminderEmail = async (to, event) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `Opomnik: Dogodek "${event.title}" se prične jutri!`,
        html: `
            <h2>Opomnik za dogodek: ${event.title}</h2>
            <p><strong>Kdaj:</strong> ${new Date(event.dateTime).toLocaleString()}</p>
            <p><strong>Opis:</strong> ${event.description || 'Ni opisa.'}</p>
            <p><strong>Lokacija:</strong> ${event.location || 'Ni lokacije.'}</p>
            <br/>
            <a href="${process.env.FRONTEND_BASE_URL}/events/${event.id}">Klikni za ogled dogodka</a>
        `
    });
};

const sendInviteNotification = async (to, userName, event) => {
    const deadline = event.signupDeadline
        ? `<p><strong>Zadnji dan za prijavo:</strong> ${new Date(event.signupDeadline).toLocaleString('sl-SI')}</p>`
        : `<p><em>Rok za prijavo ni določen.</em></p>`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `Povabilo na dogodek: ${event.title}`,
        html: `
            <h2>Bili ste dodani k dogodku: ${event.title}</h2>
            <p><strong>Kdaj:</strong> ${new Date(event.dateTime).toLocaleString('sl-SI')}</p>
            <p><strong>Opis:</strong> ${event.description || 'Ni opisa.'}</p>
            <p><strong>Lokacija:</strong> ${event.location || 'Ni lokacije.'}</p>
            ${deadline}
            <br/>
            <a href="${process.env.FRONTEND_BASE_URL}/events/${event.id}">Klikni tukaj za ogled dogodka</a>
        `
    });
};

module.exports = {
    sendCreationConfirmation,
    sendReminderEmail,
    sendInviteNotification
};