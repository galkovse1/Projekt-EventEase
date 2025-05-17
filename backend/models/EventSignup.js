const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');

const EventSignup = sequelize.define('EventSignup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

// Relacije
EventSignup.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(EventSignup, { foreignKey: 'userId' });

EventSignup.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(EventSignup, { foreignKey: 'eventId' });

module.exports = EventSignup;