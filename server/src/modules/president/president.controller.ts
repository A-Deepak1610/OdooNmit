import { Request, Response } from 'express';
import { presidentService, ApplicationStatus, RoleType } from './president.service.js';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.userId || user?.id || '';
};

export class PresidentController {
  // 1. Overview
  async getOverview(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await presidentService.getDashboardOverview(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 2. Club Profile
  async getClubProfile(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await presidentService.getClubProfile(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateClubProfile(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await presidentService.updateClubProfile(userId, req.body);
      res.json({
        success: true,
        data,
        message: 'Club profile updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 3. Announcements
  async getAnnouncements(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await presidentService.getAnnouncements(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createAnnouncement(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await presidentService.createAnnouncement(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Announcement published successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateAnnouncement(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await presidentService.updateAnnouncement(userId, id, req.body);
      res.json({
        success: true,
        data,
        message: 'Announcement updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteAnnouncement(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const result = await presidentService.deleteAnnouncement(userId, id);
      res.json({ ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 4. Membership Fee
  async updateMembershipFee(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { feeINR } = req.body;
      const data = await presidentService.updateMembershipFee(userId, Number(feeINR));
      res.json({
        success: true,
        data,
        message: `Membership dues updated to ₹${feeINR} successfully.`,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 5. Members List
  async getMembers(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await presidentService.getMembers(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 6. Applications List & Review
  async getApplications(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const status = req.query.status as ApplicationStatus | undefined;
      const data = await presidentService.getApplications(userId, status);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async reviewApplication(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be APPROVED or REJECTED.',
        });
        return;
      }

      const data = await presidentService.reviewApplication(
        userId,
        id,
        status as ApplicationStatus
      );
      res.json({
        success: true,
        data,
        message: `Membership application marked as ${status.toLowerCase()}.`,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 7. Member Role Assignment
  async assignMemberRole(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { memberUserId } = req.params;
      const { role } = req.body;

      if (!role) {
        res.status(400).json({ success: false, message: 'Role is required.' });
        return;
      }

      const data = await presidentService.assignMemberRole(
        userId,
        memberUserId,
        role as RoleType
      );
      res.json({
        success: true,
        data,
        message: 'Member role updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 8. Remove Member
  async removeMember(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { memberUserId } = req.params;
      const result = await presidentService.removeMember(userId, memberUserId);
      res.json({ ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const presidentController = new PresidentController();
