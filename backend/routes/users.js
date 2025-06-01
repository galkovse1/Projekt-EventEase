const express = require('express');
const router = express.Router();
const checkJwt = require('../middleware/auth');
const User = require('../models/User');
const { Op } = require('sequelize');
const { upload, uploadImage } = require('../controllers/uploadController');

// 🔎 Iskanje uporabnikov po imenu ali priimku – BREZ AVTENTIKACIJE
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

// ✅ Vsi spodnji route-i zahtevajo prijavo
router.use(checkJwt);

// 🔐 Pridobi svoj profil
router.get('/profile', async (req, res) => {
  let user = await User.findByPk(req.auth.payload.sub);

  if (!user) {
    user = await User.create({
      auth0Id: req.auth.payload.sub,
      email: req.auth.payload.email || '',
      name: '',
      surname: '',
      picture: req.auth.payload.picture || '',
      description: '',
      wantsNotifications: false
    });
  } else if (!user.email && req.auth.payload.email) {
    user.email = req.auth.payload.email;
    await user.save();
  }

  res.json(user);
});

// ✏️ Uredi svoj profil
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

// 🌐 Pridobi javni profil po ID
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['auth0Id', 'name', 'surname', 'picture', 'description']
  });
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' });
  res.json(user);
});

// Dodaj upload endpoint
router.post('/upload-image', upload.single('image'), uploadImage);

module.exports = router;
