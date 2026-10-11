import { Router } from 'express';
import { supportController } from './support.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';

export const supportRouter = Router();

// Protect all support routes with authentication
supportRouter.use(authenticateJwt);

// Get tickets (role-filtered: Admin views all, President views club queries + own, others view own)
supportRouter.get('/tickets', (req, res) => supportController.getTickets(req, res));

// Submit new query (any role)
supportRouter.post('/tickets', (req, res) => supportController.createTicket(req, res));

// Get ticket details & messages
supportRouter.get('/tickets/:id', (req, res) => supportController.getTicketDetails(req, res));

// Reply to ticket
supportRouter.post('/tickets/:id/reply', (req, res) => supportController.replyToTicket(req, res));

// Update ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
supportRouter.patch('/tickets/:id/status', (req, res) => supportController.updateTicketStatus(req, res));
