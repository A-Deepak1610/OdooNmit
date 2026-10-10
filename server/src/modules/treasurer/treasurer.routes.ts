import { Router } from 'express';
import { treasurerController } from './treasurer.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

export const treasurerRouter = Router();

// Protect all treasurer routes with authentication and role verification
treasurerRouter.use(authenticateJwt);
treasurerRouter.use(requireRoles(['TREASURER', 'ADMIN', 'PRESIDENT']));

// 1. Overview
treasurerRouter.get('/overview', (req, res) => treasurerController.getOverview(req, res));

// 2. Incomes
treasurerRouter.get('/incomes', (req, res) => treasurerController.getIncomes(req, res));
treasurerRouter.post('/incomes', (req, res) => treasurerController.createIncome(req, res));

// 3. Expenses
treasurerRouter.get('/expenses', (req, res) => treasurerController.getExpenses(req, res));
treasurerRouter.post('/expenses', (req, res) => treasurerController.createExpense(req, res));

// 4. Reimbursement Claims
treasurerRouter.get('/claims', (req, res) => treasurerController.getClaims(req, res));
treasurerRouter.post('/claims', (req, res) => treasurerController.createClaim(req, res));
treasurerRouter.patch('/claims/:id/review', (req, res) => treasurerController.reviewClaim(req, res));
treasurerRouter.post('/claims/:id/payout', (req, res) => treasurerController.disbursePayout(req, res));

// 5. Semester Reports
treasurerRouter.get('/reports', (req, res) => treasurerController.getReports(req, res));

// 6. Audit Trail & Payments
treasurerRouter.get('/audit', (req, res) => treasurerController.getAuditTrail(req, res));

// 7. Student Dues
treasurerRouter.get('/dues', (req, res) => treasurerController.getDues(req, res));
treasurerRouter.post('/dues/:id/pay', (req, res) => treasurerController.recordDuesPayment(req, res));

// 8. Merchandise
treasurerRouter.get('/merchandise', (req, res) => treasurerController.getMerchandise(req, res));
treasurerRouter.post('/merchandise/products', (req, res) => treasurerController.createMerchProduct(req, res));
treasurerRouter.patch('/merchandise/products/:id/stock', (req, res) => treasurerController.updateMerchStock(req, res));
treasurerRouter.patch('/merchandise/orders/:id/status', (req, res) => treasurerController.updateOrderStatus(req, res));
