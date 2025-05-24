const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventSignup = sequelize.define('EventSignup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: true // Lahko je null, če je prijava brez uporabniškega računa
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

module.exports = EventSignup;