const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventSignup = sequelize.define('EventSignup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

module.exports = EventSignup;