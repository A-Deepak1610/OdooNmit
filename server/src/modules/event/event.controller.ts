import { Request, Response } from 'express';
import { eventService } from './event.service.js';
import { ticketReservationService } from './ticket-reservation.service.js';


const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.userId || user?.id || '';
};

export class EventController {
  async getEvents(req: Request, res: Response) {
    try {
      const { search, status, domain, category, organizationId, inchargeId, postedDate, sortBy } = req.query;
      const data = await eventService.getEvents({
        search: search as string,
        status: status as string,
        domain: domain as string,
        category: category as string,
        organizationId: organizationId as string,
        inchargeId: inchargeId as string,
        postedDate: postedDate as string,
        sortBy: sortBy as string,
      });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      const data = await eventService.getEventById(id, userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async recordView(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      const data = await eventService.recordView(id, userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await eventService.createEvent(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Event published and incharge assigned successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await eventService.updateEvent(userId, id, req.body);
      res.json({
        success: true,
        data,
        message: 'Event updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async assignTask(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await eventService.assignTask(userId, id, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Volunteer task assigned successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      const data = await eventService.updateTaskStatus(taskId, status);
      res.json({
        success: true,
        data,
        message: 'Task status updated.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getOrganizerOverview(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await eventService.getOrganizerOverview(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getEventAttendees(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await eventService.getEventAttendees(id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleAttendeeCheckin(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const { checkedIn } = req.body;
      const data = await eventService.toggleAttendeeCheckin(bookingId, checkedIn !== false);
      res.json({
        success: true,
        data,
        message: checkedIn ? 'Attendee checked in successfully.' : 'Check-in undone.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getRevenueDetails(req: Request, res: Response) {
    try {
      const data = await eventService.getRevenueDetails();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getVolunteerManagement(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      const data = await eventService.getVolunteerManagement(organizationId as string);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async reserveTicket(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: eventId } = req.params;
      const { quantity } = req.body;
      const data = await ticketReservationService.reserveTicket(userId, eventId, quantity);
      res.status(201).json({
        success: true,
        data,
        message: data.message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async confirmBooking(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: eventId } = req.params;
      const { bookingWindowToken, paymentMethod, razorpayPaymentId, razorpayOrderId } = req.body;
      const data = await ticketReservationService.confirmBooking(userId, eventId, {
        bookingWindowToken,
        paymentMethod,
        razorpayPaymentId,
        razorpayOrderId,
      });
      res.status(200).json({
        success: true,
        data,
        message: data.message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async releaseReservation(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: eventId } = req.params;
      const { bookingWindowToken } = req.body;
      const data = await ticketReservationService.releaseReservation(
        userId,
        eventId,
        bookingWindowToken
      );
      res.json({
        success: true,
        data,
        message: data.message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getReservationStatus(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const data = await ticketReservationService.getReservationStatus(token);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async bookTicket(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: eventId } = req.params;
      const { quantity, paymentMethod, bookingWindowToken } = req.body;
      const data = await eventService.bookTicket(userId, eventId, {
        quantity,
        paymentMethod,
        bookingWindowToken,
      });
      res.status(201).json({
        success: true,
        data,
        message: 'Pass booked successfully! QR code and check-in OTP generated.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMyTickets(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await eventService.getMyTickets(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async verifyCheckinTicket(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const result = await eventService.verifyCheckinTicket(code);
      if (!result.success) {
        return res.status(result.alreadyCheckedIn ? 409 : 404).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async sendEventAnnouncementEmail(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: eventId } = req.params;
      const { subject, message, filter = 'ALL', priority = 'NORMAL' } = req.body;

      const result = await eventService.sendEventAnnouncementEmail(eventId, userId, {
        subject,
        message,
        filter,
        priority,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const eventController = new EventController();
