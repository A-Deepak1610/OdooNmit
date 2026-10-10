import { Router } from 'express';
import { presidentController } from './president.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

export const presidentRouter = Router();

// Protect all president routes with authentication and role check
presidentRouter.use(authenticateJwt);
presidentRouter.use(requireRoles(['PRESIDENT', 'ADMIN']));

// 1. Executive Hub Overview
presidentRouter.get('/overview', (req, res) => presidentController.getOverview(req, res));

// 2. Club Profile
presidentRouter.get('/profile', (req, res) => presidentController.getClubProfile(req, res));
presidentRouter.patch('/profile', (req, res) => presidentController.updateClubProfile(req, res));

// 3. Announcements
presidentRouter.get('/announcements', (req, res) => presidentController.getAnnouncements(req, res));
presidentRouter.post('/announcements', (req, res) => presidentController.createAnnouncement(req, res));
presidentRouter.patch('/announcements/:id', (req, res) => presidentController.updateAnnouncement(req, res));
presidentRouter.delete('/announcements/:id', (req, res) => presidentController.deleteAnnouncement(req, res));

// 4. Membership Fees
presidentRouter.patch('/membership-fee', (req, res) => presidentController.updateMembershipFee(req, res));

// 5. Club Members
presidentRouter.get('/members', (req, res) => presidentController.getMembers(req, res));
presidentRouter.patch('/members/:memberUserId/role', (req, res) => presidentController.assignMemberRole(req, res));
presidentRouter.delete('/members/:memberUserId', (req, res) => presidentController.removeMember(req, res));

// 6. Membership Applications
presidentRouter.get('/applications', (req, res) => presidentController.getApplications(req, res));
presidentRouter.patch('/applications/:id/review', (req, res) => presidentController.reviewApplication(req, res));
