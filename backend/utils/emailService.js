const nodemailer = require('nodemailer');
const { User } = require('../models/allModels');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


const wrapEmail = (title, content) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #2b7a78;">${title}</h2>
    <div style="padding: 10px 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9;">
      ${content}
    </div>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      To sporočilo je bilo poslano preko aplikacije EventEase.
    </p>
  </div>
`;

const sendCreationConfirmation = async (to, event, creator) => {
    if (!creator || !creator.wantsNotifications) {
        console.log(`⏩ Uporabnik ${event.ownerId} ne želi prejeti potrditve dogodka.`);
        return;
    }

    const content = `
    <p><strong>📅 Datum in ura:</strong> ${
        (event.dateOptions && event.dateOptions.length > 0 && !event.dateOptions.some(opt => opt.isFinal))
            ? 'Možnost izbire datuma'
            : new Date(event.dateTime).toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' })
    }</p>
    <p><strong>📍 Lokacija:</strong> ${event.location || 'Ni lokacije.'}</p>
    <p><strong>📝 Opis:</strong><br>${event.description || 'Ni opisa.'}</p>
    ${event.imageUrl ? `<img src="${event.imageUrl}" alt="Dogodek" style="max-width:100%; border-radius: 8px; margin-top: 15px;" />` : ''}
    <p style="margin-top: 20px;">
      <a href="${process.env.FRONTEND_BASE_URL}/events/${event.id}" style="
        background-color: #2b7a78; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;
      ">🔗 Ogled dogodka</a>
    </p>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `Potrdilo o ustvarjanju dogodka: ${event.title}`,
        html: wrapEmail('🎉 Dogodek uspešno ustvarjen!', content)
    });
};

const sendReminderEmail = async (to, event) => {
    const content = `
    <p><strong>📅 Datum in ura:</strong> ${
        (event.dateOptions?.length > 1 || !event.dateTime)
            ? 'Možnost izbire datuma'
            : new Date(event.dateTime).toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' })
    }</p>
    <p><strong>📍 Lokacija:</strong> ${event.location || 'Ni lokacije.'}</p>
    <p><strong>📝 Opis:</strong><br>${event.description || 'Ni opisa.'}</p>
    <p style="margin-top: 20px;">
      <a href="${process.env.FRONTEND_BASE_URL}/events/${event.id}" style="
        background-color: #2b7a78; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;
      ">🔗 Ogled dogodka</a>
    </p>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `⏰ Opomnik: Dogodek "${event.title}" je jutri!`,
        html: wrapEmail('⏰ Opomnik na dogodek', content)
    });
};

const sendInviteNotification = async (to, userName, event) => {
    const deadline = event.signupDeadline
        ? `<p><strong>🗓 Rok za prijavo:</strong> ${new Date(event.signupDeadline).toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' })}</p>`
        : `<p><em>Rok za prijavo ni določen.</em></p>`;

    const content = `
    <p>Pozdravljeni ${userName},</p>
    <p>Bili ste povabljeni na dogodek <strong>${event.title}</strong>.</p>
    <p><strong>📅 Datum in ura:</strong> ${
        (event.dateOptions?.length > 1 || !event.dateTime)
            ? 'Možnost izbire datuma'
            : new Date(event.dateTime).toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' })
    }</p>
    <p><strong>📍 Lokacija:</strong> ${event.location || 'Ni lokacije.'}</p>
    <p><strong>📝 Opis:</strong><br>${event.description || 'Ni opisa.'}</p>
    ${deadline}
    ${event.imageUrl ? `<img src="${event.imageUrl}" alt="Dogodek" style="max-width:100%; border-radius: 8px; margin-top: 15px;" />` : ''}
    <p style="margin-top: 20px;">
      <a href="${process.env.FRONTEND_BASE_URL}/events/${event.id}" style="
        background-color: #2b7a78; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;
      ">🔗 Ogled dogodka</a>
    </p>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `📨 Povabilo na dogodek: ${event.title}`,
        html: wrapEmail('📨 Povabilo na dogodek', content)
    });
};

module.exports = {
    sendCreationConfirmation,
    sendReminderEmail,
    sendInviteNotification
};
