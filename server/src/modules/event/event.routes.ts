import { Router } from 'express';
import { eventController } from './event.controller.js';
import { authenticateJwt, optionalAuthenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

export const eventRouter = Router();

// Organizer & Public Read Routes
eventRouter.get('/organizer/overview', (req, res) => eventController.getOrganizerOverview(req, res));
eventRouter.get('/organizer/revenue', (req, res) => eventController.getRevenueDetails(req, res));
eventRouter.get('/organizer/volunteers', (req, res) => eventController.getVolunteerManagement(req, res));

// 1. Read routes (Students, Members, Volunteers, Organizers can view)
eventRouter.get('/', (req, res) => eventController.getEvents(req, res));
eventRouter.get('/tickets/my-tickets', authenticateJwt, (req, res) => eventController.getMyTickets(req, res));
eventRouter.get('/:id', optionalAuthenticateJwt, (req, res) => eventController.getEventById(req, res));
eventRouter.post('/:id/view', optionalAuthenticateJwt, (req, res) => eventController.recordView(req, res));
eventRouter.get('/:id/attendees', (req, res) => eventController.getEventAttendees(req, res));

// QR Code Generation & Passes (Powered by Node.js 'qrcode' library)
eventRouter.all('/tickets/generate-qr', (req, res) => eventController.generateQrCode(req, res));
eventRouter.get('/tickets/recent-passes', (req, res) => eventController.getRecentTickets(req, res));
eventRouter.post('/tickets/verify-checkin', (req, res) => eventController.verifyCheckinTicket(req, res));

// 2. Protected routes requiring authentication
eventRouter.use(authenticateJwt);

// User ticket passes & Booking (Protected by authenticateJwt)
eventRouter.post('/:id/reserve', (req, res) => eventController.reserveTicket(req, res));
eventRouter.post('/:id/confirm-booking', (req, res) => eventController.confirmBooking(req, res));
eventRouter.post('/:id/release-reservation', (req, res) => eventController.releaseReservation(req, res));
eventRouter.get('/reservation-status/:token', (req, res) => eventController.getReservationStatus(req, res));
eventRouter.post('/:id/book', (req, res) => eventController.bookTicket(req, res));

// Door Check-in Verification (by QR code string or 6-digit OTP)
eventRouter.post('/tickets/verify-checkin', (req, res) => eventController.verifyCheckinTicket(req, res));

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

// Send email announcement to registered attendees with check-in filter (Event Organizer, President, Admin)
eventRouter.post(
  '/:id/announcement-email',
  requireRoles(['PRESIDENT', 'EVENT_ORGANIZER', 'ADMIN']),
  (req, res) => eventController.sendEventAnnouncementEmail(req, res)
);
