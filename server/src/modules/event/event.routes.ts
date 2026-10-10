import { Router } from 'express';
import { eventController } from './event.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

export const eventRouter = Router();

// Organizer & Public Read Routes
eventRouter.get('/organizer/overview', (req, res) => eventController.getOrganizerOverview(req, res));
eventRouter.get('/organizer/revenue', (req, res) => eventController.getRevenueDetails(req, res));
eventRouter.get('/organizer/volunteers', (req, res) => eventController.getVolunteerManagement(req, res));

// 1. Read routes (Students, Members, Volunteers, Organizers can view)
eventRouter.get('/', (req, res) => eventController.getEvents(req, res));
eventRouter.get('/:id', (req, res) => eventController.getEventById(req, res));
eventRouter.get('/:id/attendees', (req, res) => eventController.getEventAttendees(req, res));

// 2. Protected routes requiring authentication
eventRouter.use(authenticateJwt);

// Check-in toggle on event day
eventRouter.post(
  '/attendees/:bookingId/checkin',
  requireRoles(['EVENT_ORGANIZER', 'PRESIDENT', 'VOLUNTEER', 'ADMIN']),
  (req, res) => eventController.toggleAttendeeCheckin(req, res)
);

// Create event (Club President, Event Organizer, Super Admin)
eventRouter.post(
  '/',
  requireRoles(['PRESIDENT', 'EVENT_ORGANIZER', 'ADMIN']),
  (req, res) => eventController.createEvent(req, res)
);

// Update event details, status, fees, ticket count
eventRouter.patch(
  '/:id',
  requireRoles(['PRESIDENT', 'EVENT_ORGANIZER', 'ADMIN']),
  (req, res) => eventController.updateEvent(req, res)
);

// Assign Volunteer task for this event (Event Organizer, President)
eventRouter.post(
  '/:id/tasks',
  requireRoles(['PRESIDENT', 'EVENT_ORGANIZER', 'ADMIN']),
  (req, res) => eventController.assignTask(req, res)
);

// Volunteer updates task status
eventRouter.patch('/tasks/:taskId/status', (req, res) => eventController.updateTaskStatus(req, res));
