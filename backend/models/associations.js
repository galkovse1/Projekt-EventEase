const User = require('./User');
const Event = require('./Event');
const EventSignup = require('./EventSignup');
const EventVisibility = require('./EventVisibility');
const EventDateOption = require('./EventDateOption');
const DateVote = require('./DateVote');

Event.hasMany(EventDateOption, { foreignKey: 'eventId', as: 'dateOptions' });
EventDateOption.belongsTo(Event, { foreignKey: 'eventId' });

EventDateOption.hasMany(DateVote, { foreignKey: 'dateOptionId', as: 'votes' });
DateVote.belongsTo(EventDateOption, { foreignKey: 'dateOptionId' });

// Event owner
Event.belongsTo(User, { foreignKey: 'ownerId', targetKey: 'auth0Id', as: 'User' });

// Signup povezave
Event.hasMany(EventSignup, { foreignKey: 'eventId', as: 'EventSignups' });
EventSignup.belongsTo(Event, { foreignKey: 'eventId', as: 'Event' });

EventSignup.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(EventSignup, { foreignKey: 'userId' });

// Many-to-many: Event <-> User (vidnost za "selected")
Event.belongsToMany(User, {
    through: EventVisibility,
    as: 'VisibleToUsers',
    foreignKey: 'EventId',
    otherKey: 'UserId'
});
User.belongsToMany(Event, {
    through: EventVisibility,
    as: 'VisibleEvents',
    foreignKey: 'UserId',
    otherKey: 'EventId'
});

module.exports = { User, Event, EventSignup, EventVisibility, EventDateOption, DateVote };
