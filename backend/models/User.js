const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
 id: {
  type: DataTypes.STRING,   // Auth0 ID, npr. 'auth0|abc123'
  primaryKey: true
},
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
});

module.exports = User;
