const User = require('./User');
const Event = require('./Event');
const EventSignup = require('./EventSignup');

// User - Event
Event.belongsTo(User, { foreignKey: 'ownerId', targetKey: 'auth0Id', as: 'User' });

// User - EventSignup
// (odstranjeno)
// EventSignup.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Event - EventSignup
Event.hasMany(EventSignup, { foreignKey: 'eventId', as: 'EventSignups' });
EventSignup.belongsTo(Event, { foreignKey: 'eventId', as: 'Event' });

module.exports = { User, Event, EventSignup }; 