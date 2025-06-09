const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Event = require('./Event'); // Import Event model

const EventDateOption = sequelize.define('EventDateOption', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Events',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    dateOption: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isFinal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

if (process.env.NODE_ENV !== 'test') {
    EventDateOption.belongsTo(Event, { foreignKey: 'eventId' });
    Event.hasMany(EventDateOption, { foreignKey: 'eventId' });
}

module.exports = EventDateOption;