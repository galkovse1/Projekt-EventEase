const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const Event = require('./models/Event');
const EventSignup = require('./models/EventSignup');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const signupRoutes = require('./routes/signups');
const runReminderJob = require('./reminderScheduler');

require('./models/associations');

const app = express();
app.use(cors({
    origin: ['https://projekt-event-ease.vercel.app'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Server is running!');
});
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/signups', signupRoutes);

sequelize.authenticate()
    .then(() => {
        console.log('✅ Povezava z bazo uspešna');
        return sequelize.sync();// <-- Dodano za posodobitev struktur
    })
    .then(() => {
        app.listen(PORT, () => {
            setInterval(runReminderJob, 60 * 1000); // ⏱️ Kliči vsakih 60 sekund
            console.log(`🚀 Server posluša na http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Napaka pri povezavi ali sinhronizaciji:', err);
    });