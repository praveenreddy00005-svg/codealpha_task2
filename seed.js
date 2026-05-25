import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import User from './models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@events.com',
      password: 'admin123',
      role: 'admin',
    });

    const organizer = await User.create({
      name: 'Jane Organizer',
      email: 'organizer@events.com',
      password: 'organizer123',
      role: 'organizer',
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@events.com',
      password: 'user1234',
      role: 'user',
    });

    const events = await Event.insertMany([
      {
        title: 'Tech Conference 2026',
        description:
          'Annual technology conference featuring keynotes, workshops, and networking with industry leaders.',
        date: new Date('2026-08-15T09:00:00'),
        location: 'Convention Center, San Francisco',
        capacity: 500,
        registeredCount: 0,
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      },
      {
        title: 'React Workshop',
        description:
          'Hands-on workshop covering React hooks, state management, and modern patterns.',
        date: new Date('2026-06-20T14:00:00'),
        location: 'Online - Zoom',
        capacity: 50,
        registeredCount: 0,
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      },
      {
        title: 'Startup Networking Night',
        description:
          'Meet founders, investors, and innovators in an informal networking setting.',
        date: new Date('2026-07-10T18:00:00'),
        location: 'Innovation Hub, Austin',
        capacity: 100,
        registeredCount: 0,
        organizer: admin._id,
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      },
      {
        title: 'Design Systems Meetup',
        description: 'Learn about building scalable design systems for modern web applications.',
        date: new Date('2026-05-30T17:00:00'),
        location: 'Design Studio, New York',
        capacity: 30,
        registeredCount: 0,
        organizer: organizer._id,
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      },
    ]);

    const reg1 = await Registration.create({
      user: user._id,
      event: events[1]._id,
      status: 'confirmed',
    });

    events[1].registeredCount = 1;
    await events[1].save();

    console.log('\n--- Seed completed successfully ---\n');
    console.log('Test accounts (password shown):');
    console.log('  Admin:     admin@events.com / admin123');
    console.log('  Organizer: organizer@events.com / organizer123');
    console.log('  User:      user@events.com / user1234');
    console.log(`\nCreated ${events.length} events and 1 sample registration`);
    console.log(`Registration ID: ${reg1._id}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
