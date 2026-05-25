import sequelize from '../config/database.js';
import User from './User.js';
import Event from './Event.js';
import Registration from './Registration.js';

// User (Organizer) <-> Event (1-to-many)
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// User (Attendee) <-> Registration (1-to-many)
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations', onDelete: 'CASCADE' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event <-> Registration (1-to-many)
Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations', onDelete: 'CASCADE' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

export {
  sequelize,
  User,
  Event,
  Registration
};
