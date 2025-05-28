
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const User = require('./models/User');

async function seedUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Povezava z bazo uspešna.');

    const testUsers = [
      { auth0Id: 'auth0|user1', name: 'Ana', surname: 'Novak', email: 'ana.novak@example.com' },
      { auth0Id: 'auth0|user2', name: 'Marko', surname: 'Kovač', email: 'marko.kovac@example.com' },
      { auth0Id: 'auth0|user3', name: 'Petra', surname: 'Horvat', email: 'petra.horvat@example.com' },
      { auth0Id: 'auth0|user4', name: 'Luka', surname: 'Zupan', email: 'luka.zupan@example.com' },
      { auth0Id: 'auth0|user5', name: 'Nina', surname: 'Kralj', email: 'nina.kralj@example.com' },
      { auth0Id: 'auth0|user6', name: 'Miha', surname: 'Vidmar', email: 'miha.vidmar@example.com' },
      { auth0Id: 'auth0|user7', name: 'Tina', surname: 'Koren', email: 'tina.koren@example.com' },
      { auth0Id: 'auth0|user8', name: 'Žan', surname: 'Kos', email: 'zan.kos@example.com' },
      { auth0Id: 'auth0|user9', name: 'Eva', surname: 'Mlakar', email: 'eva.mlakar@example.com' },
      { auth0Id: 'auth0|user10', name: 'Nejc', surname: 'Potočnik', email: 'nejc.potocnik@example.com' },
      { auth0Id: 'auth0|user11', name: 'Sara', surname: 'Bizjak', email: 'sara.bizjak@example.com' },
      { auth0Id: 'auth0|user12', name: 'David', surname: 'Turk', email: 'david.turk@example.com' },
      { auth0Id: 'auth0|user13', name: 'Maja', surname: 'Hočevar', email: 'maja.hocevar@example.com' },
      { auth0Id: 'auth0|user14', name: 'Jan', surname: 'Kastelic', email: 'jan.kastelic@example.com' },
      { auth0Id: 'auth0|user15', name: 'Katarina', surname: 'Cerar', email: 'katarina.cerar@example.com' },
      { auth0Id: 'auth0|user16', name: 'Andrej', surname: 'Lapajne', email: 'andrej.lapajne@example.com' },
      { auth0Id: 'auth0|user17', name: 'Urška', surname: 'Blažič', email: 'urska.blazic@example.com' },
      { auth0Id: 'auth0|user18', name: 'Rok', surname: 'Dolenc', email: 'rok.dolenc@example.com' },
      { auth0Id: 'auth0|user19', name: 'Tjaša', surname: 'Rebernik', email: 'tjasa.rebernik@example.com' },
      { auth0Id: 'auth0|user20', name: 'Simon', surname: 'Pretnar', email: 'simon.pretnar@example.com' }
    ];

    for (const user of testUsers) {
      await User.findOrCreate({ where: { auth0Id: user.auth0Id }, defaults: user });
    }

    console.log('✅ Testni uporabniki so bili uspešno dodani.');
    process.exit();
  } catch (error) {
    console.error('❌ Napaka pri dodajanju uporabnikov:', error);
    process.exit(1);
  }
}

seedUsers();
