import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

const router = Router();

// Protect all admin endpoints with JWT authentication
router.use(authenticateJwt);

// Overview metrics
router.get('/overview', requireRoles(['ADMIN']), (req, res) => adminController.getOverview(req, res));

// Clubs Management
router.get('/clubs', requireRoles(['ADMIN']), (req, res) => adminController.getClubs(req, res));
router.post('/clubs', requireRoles(['ADMIN']), (req, res) => adminController.createClub(req, res));
router.patch('/clubs/:id', requireRoles(['ADMIN']), (req, res) => adminController.updateClub(req, res));
router.patch('/clubs/:id/status', requireRoles(['ADMIN']), (req, res) => adminController.updateClubStatus(req, res));
router.post('/clubs/:id/president', requireRoles(['ADMIN']), (req, res) => adminController.assignPresident(req, res));

// Support Tickets & Resolution
router.get('/tickets', requireRoles(['ADMIN']), (req, res) => adminController.getTickets(req, res));
router.get('/tickets/:id', requireRoles(['ADMIN']), (req, res) => adminController.getTicketDetails(req, res));
router.post('/tickets/:id/reply', requireRoles(['ADMIN']), (req, res) => adminController.replyTicket(req, res));
router.patch('/tickets/:id/status', requireRoles(['ADMIN']), (req, res) => adminController.updateTicketStatus(req, res));

// Elections & Atomic Voting
router.get('/elections', (req, res) => adminController.getElections(req, res)); // All authenticated users can view
router.post('/elections', requireRoles(['ADMIN']), (req, res) => adminController.createElection(req, res));
router.patch('/elections/:id/status', requireRoles(['ADMIN']), (req, res) => adminController.updateElectionStatus(req, res));
router.post('/elections/:id/nominate', (req, res) => adminController.applyNomination(req, res)); // Students can apply
router.patch('/elections/candidates/:candidateId/status', requireRoles(['ADMIN']), (req, res) => adminController.updateCandidateStatus(req, res));
router.post('/elections/:id/vote', (req, res) => adminController.castVote(req, res)); // 1-time atomic vote
router.post('/elections/:id/finalize', requireRoles(['ADMIN']), (req, res) => adminController.finalizeElection(req, res)); // Closes and promotes winner to President!

// Central Announcements
router.get('/announcements', requireRoles(['ADMIN']), (req, res) => adminController.getAnnouncements(req, res));
router.post('/announcements', requireRoles(['ADMIN']), (req, res) => adminController.createAnnouncement(req, res));
router.patch('/announcements/:id', requireRoles(['ADMIN']), (req, res) => adminController.updateAnnouncement(req, res));
router.delete('/announcements/:id', requireRoles(['ADMIN']), (req, res) => adminController.deleteAnnouncement(req, res));

// DB Assistant Natural Query
router.post('/db-assistant', requireRoles(['ADMIN']), (req, res) => adminController.queryDbAssistant(req, res));

export const adminRouter = router;
