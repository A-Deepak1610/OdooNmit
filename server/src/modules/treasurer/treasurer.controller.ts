import { Request, Response } from 'express';
import { treasurerService } from './treasurer.service.js';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.userId || user?.id || '';
};

export class TreasurerController {
  // 1. Overview
  async getOverview(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.getOverview(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 2. Incomes
  async getIncomes(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { source, method, query } = req.query as any;
      const data = await treasurerService.getIncomes(userId, { source, method, query });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createIncome(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.createIncome(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Income entry recorded successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 3. Expenses
  async getExpenses(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { category, method, query } = req.query as any;
      const data = await treasurerService.getExpenses(userId, { category, method, query });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createExpense(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.createExpense(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Expense recorded successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 4. Reimbursement Claims
  async getClaims(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { status, query } = req.query as any;
      const data = await treasurerService.getClaims(userId, { status, query });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createClaim(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.createClaim(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Reimbursement claim submitted successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async reviewClaim(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await treasurerService.reviewClaim(userId, id, req.body);
      res.json({
        success: true,
        data,
        message: `Claim successfully ${data.status.toLowerCase()}.`,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async disbursePayout(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await treasurerService.disbursePayout(userId, id, req.body);
      res.json({
        success: true,
        data,
        message: 'Payout recorded and marked as disbursed.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 5. Semester Reports
  async getReports(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.getReports(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 6. Audit Trail & Payments
  async getAuditTrail(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { type, query } = req.query as any;
      const data = await treasurerService.getAuditTrail(userId, { type, query });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 7. Student Dues
  async getDues(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { status, query, department } = req.query as any;
      const data = await treasurerService.getDues(userId, { status, query, department });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async recordDuesPayment(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await treasurerService.recordDuesPayment(userId, id, req.body);
      res.json({
        success: true,
        data,
        message: 'Student dues payment recorded successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 8. Merchandise
  async getMerchandise(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.getMerchandise(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createMerchProduct(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await treasurerService.createMerchProduct(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Merchandise product added successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateMerchStock(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { variantSku, delta, reason } = req.body;
      const data = await treasurerService.updateMerchStock(userId, id, variantSku, delta, reason);
      res.json({
        success: true,
        data,
        message: 'Stock adjusted successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await treasurerService.updateOrderStatus(userId, id, req.body);
      res.json({
        success: true,
        data,
        message: 'Order status updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const treasurerController = new TreasurerController();
