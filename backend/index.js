const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Event = require('./models/Event');
const EventSignup = require('./models/EventSignup');
const eventRoutes = require('./routes/events');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const signupRoutes = require('./routes/signups');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Server is running!');
});
app.use('/api/events', eventRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/signups', signupRoutes);


sequelize.authenticate()
  .then(() => {
    console.log('✅ Povezava z bazo uspešna');

    // Sinhronizacija modelov z bazo
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("📦 Tabele so sinhronizirane z bazo");
    app.listen(PORT, () => {
      console.log(`🚀 Server posluša na http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Napaka pri povezavi ali sinhronizaciji:', err);
  });
