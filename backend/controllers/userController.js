const User = require('../models/User');

const createUser = async (req, res) => {
    try {
        const { name, surname, username, email, profileImage, description } = req.body;
        const newUser = await User.create({ name, surname, username, email, profileImage, description });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Napaka pri ustvarjanju uporabnika' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: ['Events', 'EventSignups']
        });
        if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Napaka pri branju uporabnika' });
    }
};

module.exports = { createUser, getProfile };
