const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DateVote = sequelize.define('DateVote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOptionId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

module.exports = DateVote;