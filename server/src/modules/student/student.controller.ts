import { Request, Response } from 'express';
import { studentService } from './student.service.js';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.userId || user?.id || '';
};

export class StudentController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await studentService.getNotifications(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async markNotificationAsRead(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await studentService.markNotificationAsRead(userId, id);
      res.json({ success: true, data, message: 'Notification marked as read.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async markAllNotificationsAsRead(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      await studentService.markAllNotificationsAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getClubs(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await studentService.getClubs(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async applyMembership(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: organizationId } = req.params;
      const { statementOfPurpose, experience, department, semester } = req.body;

      const data = await studentService.applyForMembership(userId, organizationId, {
        statementOfPurpose,
        experience,
        department,
        semester,
      });

      res.status(201).json({
        success: true,
        data,
        message: 'Membership application submitted successfully. Pending review.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getElections(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await studentService.getElections(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async applyNomination(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: electionId } = req.params;
      const { statementOfPurpose, experience, manifesto } = req.body;

      if (!statementOfPurpose?.trim() || !experience?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Please provide both your statement of purpose (why applying) and relevant leadership experience.',
        });
        return;
      }

      const data = await studentService.applyForNomination(userId, electionId, {
        statementOfPurpose,
        experience,
        manifesto: manifesto || statementOfPurpose,
      });

      res.status(201).json({
        success: true,
        data,
        message: 'Nomination submitted successfully! It has been forwarded to Super Admin for verification.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async castVote(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id: electionId } = req.params;
      const { candidateId } = req.body;

      if (!candidateId) {
        res.status(400).json({ success: false, message: 'Candidate ID is required to cast vote.' });
        return;
      }

      const data = await studentService.castVote(userId, electionId, candidateId);
      res.json({
        success: true,
        data,
        message: 'Vote registered successfully! Your atomic ballot has been officially recorded.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const studentController = new StudentController();
