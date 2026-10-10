import { Request, Response } from 'express';
import { adminService } from './admin.service.js';
import { sendSuccess, sendError } from '../../common/utils/api-response.util.js';

export class AdminController {
  async getOverview(req: Request, res: Response) {
    try {
      const data = await adminService.getDashboardOverview();
      return sendSuccess(res, data, 'Super Admin overview loaded');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getClubs(req: Request, res: Response) {
    try {
      const { search, status, category } = req.query as any;
      const data = await adminService.getClubs({ search, status, category });
      return sendSuccess(res, data, 'Clubs retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createClub(req: Request, res: Response) {
    try {
      const data = await adminService.createClub(req.body);
      return sendSuccess(res, data, 'Club created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateClubStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const data = await adminService.updateClubStatus(id, Boolean(isActive));
      return sendSuccess(res, data, `Club ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async assignPresident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const data = await adminService.assignClubPresident(id, userId);
      return sendSuccess(res, data, 'President assigned successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getTickets(req: Request, res: Response) {
    try {
      const { status, category, priority, search } = req.query as any;
      const data = await adminService.getTickets({ status, category, priority, search });
      return sendSuccess(res, data, 'Tickets retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getTicketDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await adminService.getTicketDetails(id);
      return sendSuccess(res, data, 'Ticket details loaded');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  async replyTicket(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { message, status } = req.body;
      const adminId = req.user?.userId;

      if (!message?.trim()) {
        return sendError(res, 'Reply message cannot be empty', 400);
      }

      const data = await adminService.replyToTicket(id, adminId!, message, status);
      return sendSuccess(res, data, 'Reply sent successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateTicketStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await adminService.updateTicketStatus(id, status);
      return sendSuccess(res, data, 'Ticket status updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getElections(req: Request, res: Response) {
    try {
      const data = await adminService.getElections();
      return sendSuccess(res, data, 'Elections loaded');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createElection(req: Request, res: Response) {
    try {
      const data = await adminService.createElection(req.body);
      return sendSuccess(res, data, 'Election announced and notifications sent', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateElectionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await adminService.updateElectionStatus(id, status);
      return sendSuccess(res, data, 'Election status updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async applyNomination(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { manifesto } = req.body;
      const userId = req.user?.userId;
      const data = await adminService.applyNomination(id, userId!, manifesto);
      return sendSuccess(res, data, 'Nomination submitted successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateCandidateStatus(req: Request, res: Response) {
    try {
      const { candidateId } = req.params;
      const { status } = req.body;
      const data = await adminService.updateCandidateStatus(candidateId, status);
      return sendSuccess(res, data, `Candidate nomination ${status.toLowerCase()}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async castVote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { candidateId } = req.body;
      const voterId = req.user?.userId;
      const data = await adminService.castVote(id, voterId!, candidateId);
      return sendSuccess(res, data, 'Vote successfully registered');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async finalizeElection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await adminService.finalizeElection(id);
      return sendSuccess(res, data, 'Election finalized and President promoted!');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async queryDbAssistant(req: Request, res: Response) {
    try {
      const { query } = req.body;
      if (!query?.trim()) {
        return sendError(res, 'Query cannot be empty', 400);
      }
      const data = await adminService.processDbAssistantQuery(query);
      return sendSuccess(res, data, 'Assistant query processed');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const adminController = new AdminController();
