const express = require('express');
const router = express.Router();
const checkJwt = require('../middleware/auth');
const User = require('../models/User');

// All routes require authentication
router.use(checkJwt);

// Pridobi svoj profil
router.get('/profile', async (req, res) => {
  let user = await User.findByPk(req.auth.payload.sub);
  if (!user) {
    // Ustvari uporabnika z emailom iz Auth0, ostalo prazno
    user = await User.create({
      auth0Id: req.auth.payload.sub,
      email: req.auth.payload.email || '',
      name: '',
      surname: '',
      picture: req.auth.payload.picture || '',
      description: ''
    });
  } else if (!user.email && req.auth.payload.email) {
    user.email = req.auth.payload.email;
    await user.save();
  }
  res.json(user);
});

// Uredi svoj profil
router.patch('/profile', async (req, res) => {
  const user = await User.findByPk(req.auth.payload.sub);
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' });
  const { name, surname, picture, description } = req.body;
  if (name !== undefined) user.name = name;
  if (surname !== undefined) user.surname = surname;
  if (picture !== undefined) user.picture = picture;
  if (description !== undefined) user.description = description;
  await user.save();
  res.json(user);
});

// Pridobi javni profil po ID
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: ['auth0Id', 'name', 'surname', 'picture', 'description'] });
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' });
  res.json(user);
});

module.exports = router;