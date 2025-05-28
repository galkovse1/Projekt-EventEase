const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventVisibility = sequelize.define('EventVisibility', {
    EventId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    }
}, {
    timestamps: true,
    tableName: 'EventVisibilities'
});

module.exports = EventVisibility;
