const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Event = require('./models/Event');
const EventSignup = require('./models/EventSignup');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Server is running!');
});

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
