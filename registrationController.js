import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);

    if (!event || !event.isPublished) {
      throw new AppError('Event not found', 404);
    }

    if (new Date(event.date) < new Date()) {
      throw new AppError('Cannot register for past events', 400);
    }

    if (event.registeredCount >= event.capacity) {
      throw new AppError('Event is at full capacity', 400);
    }

    const existing = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      status: 'confirmed',
    }).session(session);

    if (existing) {
      throw new AppError('You are already registered for this event', 400);
    }

    const cancelled = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      status: 'cancelled',
    }).session(session);

    let registration;

    if (cancelled) {
      cancelled.status = 'confirmed';
      await cancelled.save({ session });
      registration = cancelled;
    } else {
      const created = await Registration.create(
        [{ user: req.user._id, event: eventId }],
        { session }
      );
      registration = created[0];
    }

    event.registeredCount += 1;
    await event.save({ session });

    await session.commitTransaction();

    const populated = await Registration.findById(registration._id)
      .populate('event', 'title date location capacity registeredCount')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      registration: populated,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    user: req.user._id,
    status: 'confirmed',
  })
    .populate({
      path: 'event',
      populate: { path: 'organizer', select: 'name email' },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations,
  });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const registration = await Registration.findById(req.params.id).session(session);

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      throw new AppError('You can only cancel your own registrations', 403);
    }

    if (registration.status === 'cancelled') {
      throw new AppError('Registration is already cancelled', 400);
    }

    const event = await Event.findById(registration.event).session(session);

    if (!event) {
      throw new AppError('Associated event not found', 404);
    }

    registration.status = 'cancelled';
    await registration.save({ session });

    event.registeredCount = Math.max(0, event.registeredCount - 1);
    await event.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const isAdmin = req.user.role === 'admin';
  const isOrganizer =
    req.user.role === 'organizer' &&
    event.organizer.toString() === req.user._id.toString();

  if (!isAdmin && !isOrganizer) {
    throw new AppError('You do not have permission to view these registrations', 403);
  }

  const registrations = await Registration.find({
    event: req.params.eventId,
    status: 'confirmed',
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations,
  });
});
