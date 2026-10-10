import { Router } from 'express';
import { studentController } from './student.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';

export const studentRouter = Router();

// All student routes require valid authenticated user session
studentRouter.use(authenticateJwt);

// 1. Notifications
studentRouter.get('/notifications', (req, res) => studentController.getNotifications(req, res));
studentRouter.patch('/notifications/:id/read', (req, res) => studentController.markNotificationAsRead(req, res));
studentRouter.post('/notifications/read-all', (req, res) => studentController.markAllNotificationsAsRead(req, res));

// 2. Clubs & Membership Applications
studentRouter.get('/clubs', (req, res) => studentController.getClubs(req, res));
studentRouter.post('/clubs/:id/apply', (req, res) => studentController.applyMembership(req, res));

// 3. Elections, Nominations & Voting
studentRouter.get('/elections', (req, res) => studentController.getElections(req, res));
studentRouter.post('/elections/:id/nominate', (req, res) => studentController.applyNomination(req, res));
studentRouter.post('/elections/:id/vote', (req, res) => studentController.castVote(req, res));
