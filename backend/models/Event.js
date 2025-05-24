const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    dateTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    allowSignup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ownerId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    maxSignups: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Event;