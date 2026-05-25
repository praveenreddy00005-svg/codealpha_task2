import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const canManageEvent = (user, event) => {
  if (user.role === 'admin') return true;
  if (user.role === 'organizer' && event.organizer.toString() === user._id.toString()) {
    return true;
  }
  return false;
};

export const getEvents = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.upcoming === 'true') {
    filter.date = { $gte: new Date() };
  }

  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  res.status(200).json({
    success: true,
    event,
  });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    organizer: req.user._id,
  });

  const populated = await Event.findById(event._id).populate('organizer', 'name email');

  res.status(201).json({
    success: true,
    event: populated,
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!canManageEvent(req.user, event)) {
    throw new AppError('You do not have permission to update this event', 403);
  }

  if (req.body.capacity !== undefined && req.body.capacity < event.registeredCount) {
    throw new AppError(
      `Capacity cannot be less than current registrations (${event.registeredCount})`,
      400
    );
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('organizer', 'name email');

  res.status(200).json({
    success: true,
    event,
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!canManageEvent(req.user, event)) {
    throw new AppError('You do not have permission to delete this event', 403);
  }

  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? {}
      : { organizer: req.user._id };

  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
});
