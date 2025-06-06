const axios = require('axios'); // 🔼 Dodaj na vrh datoteke, če še ni
const express = require('express');
const router = express.Router();
const checkJwt = require('../middleware/auth');
const User = require('../models/User');
const { Op } = require('sequelize');
const { upload, uploadImage } = require('../controllers/uploadController');

// Iskanje uporabnikov po imenu ali priimku – BREZ AVTENTIKACIJE
router.get('/search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ message: 'Manjka iskalni niz.' });
  }

  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { surname: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['auth0Id', 'name', 'surname', 'email', 'picture']
    });

    res.json(users);
  } catch (error) {
    console.error('Napaka pri iskanju:', error);
    res.status(500).json({ message: 'Napaka pri iskanju uporabnikov.' });
  }
});


router.use(checkJwt);

// Funkcija za izluščenje imena in priimka iz emaila
function parseNameFromEmail(email) {
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) {
    return { name: capitalize(parts[0]), surname: capitalize(parts[1]) };
  }
  return { name: capitalize(local), surname: '' };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Pridobi svoj profil
router.get('/profile', async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  let email = req.auth.payload.email || '';
  let picture = req.auth.payload.picture || '';

  // Če ni emaila, pridobi prek Auth0 /userinfo
  if (!email) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const response = await axios.get('https://dev-r12pt12nxl2304iz.us.auth0.com/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      email = response.data.email || '';
      picture = response.data.picture || picture;

      console.log(`Email pridobljen iz /userinfo: ${email}`);
    } catch (err) {
      console.warn('Napaka pri pridobivanju emaila iz /userinfo:', err.message);
    }
  }

  let user = await User.findByPk(auth0Id);

  if (!user) {
    // Izlušči ime in priimek iz emaila, če ni podano
    const parsed = parseNameFromEmail(email);
    user = await User.create({
      auth0Id,
      email,
      name: parsed.name,
      surname: parsed.surname,
      picture,
      description: '',
      wantsNotifications: true
    });
  } else if (!user.email && email) {
    user.email = email;
    await user.save();
  }

  res.json(user);
});

// Uredi svoj profil
router.patch('/profile', async (req, res) => {
  const user = await User.findByPk(req.auth.payload.sub);
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' });

  const { name, surname, picture, description, wantsNotifications } = req.body;

  if (name !== undefined) user.name = name;
  if (surname !== undefined) user.surname = surname;
  if (picture !== undefined) user.picture = picture;
  if (description !== undefined) user.description = description;
  if (wantsNotifications !== undefined) user.wantsNotifications = wantsNotifications;

  await user.save();
  res.json(user);
});

// Pridobi javni profil po ID
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['auth0Id', 'name', 'surname', 'picture', 'description']
  });
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' });
  res.json(user);
});

// Dodaj upload endpoint
router.post('/upload-image', upload.single('image'), uploadImage);

// Izbriši svoj profil
router.delete('/profile', async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  try {
    // Izbriši vse dogodke, kjer je ta uporabnik lastnik
    const { Event } = require('../models/allModels');
    await Event.destroy({ where: { ownerId: auth0Id } });
    // Izbriši uporabnika
    const user = await User.findByPk(auth0Id);
    if (user) {
      await user.destroy();
      return res.status(204).send();
    } else {
      return res.status(404).json({ error: 'Uporabnik ne obstaja' });
    }
  } catch (error) {
    console.error('Napaka pri brisanju profila:', error);
    return res.status(500).json({ error: 'Napaka pri brisanju profila' });
  }
});

module.exports = router;
