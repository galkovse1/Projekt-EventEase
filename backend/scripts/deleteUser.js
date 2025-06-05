const { User, Event } = require('../models/allModels');
require('dotenv').config();

async function deleteUser() {
    try {
        const user = await User.findOne({ where: { email: 'kovsig@gmail.com' } });
        if (user) {
            // Najprej izbriši vse dogodke, kjer je ta uporabnik lastnik
            await Event.destroy({ where: { ownerId: user.auth0Id } });
            // Nato izbriši uporabnika
            await user.destroy();
            console.log('Uporabnik in njegovi dogodki uspešno izbrisani');
        } else {
            console.log('Uporabnik ne obstaja');
        }
    } catch (error) {
        console.error('Napaka pri brisanju uporabnika:', error);
    } finally {
        process.exit();
    }
}

deleteUser(); 