import { Request, Response } from 'express';
import { supportService } from './support.service.js';
import { TicketStatus } from '@prisma/client';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.userId || user?.id || '';
};

export class SupportController {
  async getTickets(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { status, category, priority, organizationId, search } = req.query;
      const data = await supportService.getTickets(userId, {
        status: status as string,
        category: category as string,
        priority: priority as string,
        organizationId: organizationId as string,
        search: search as string,
      });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createTicket(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await supportService.createTicket(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Query submitted successfully. Our team will review and respond shortly.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getTicketDetails(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await supportService.getTicketDetails(userId, id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async replyToTicket(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { message, status } = req.body;
      const data = await supportService.replyToTicket(userId, id, message, status as TicketStatus);
      res.json({ success: true, data, message: 'Reply sent successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateTicketStatus(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { status } = req.body;
      const data = await supportService.updateTicketStatus(userId, id, status as TicketStatus);
      res.json({ success: true, data, message: `Query status updated to ${status}.` });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const supportController = new SupportController();
