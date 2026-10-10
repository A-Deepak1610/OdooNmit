import { Router } from 'express';
import { merchandiseController } from './merchandise.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

export const merchandiseRouter = Router();

// Public / Semi-public catalog view (optional auth handled in controller if token present)
merchandiseRouter.get('/', (req, res, next) => {
  // Try authenticate if header present, but don't reject if not
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJwt(req, res, () => merchandiseController.getProducts(req, res));
  }
  return merchandiseController.getProducts(req, res);
});

merchandiseRouter.get('/product/:id', (req, res) => merchandiseController.getProductById(req, res));

// Authenticated Routes
merchandiseRouter.use(authenticateJwt);

// Student / Member orders
merchandiseRouter.get('/my-orders', (req, res) => merchandiseController.getMyOrders(req, res));
merchandiseRouter.post('/order', (req, res) => merchandiseController.placeOrder(req, res));

// Analytics & Financial Records
merchandiseRouter.get('/analytics', (req, res) => merchandiseController.getMerchandiseAnalytics(req, res));
merchandiseRouter.get('/event-finance', (req, res) => merchandiseController.getEventFinanceRecord(req, res));

// Campus Lead / Admin Product Management
merchandiseRouter.post(
  '/products',
  requireRoles(['PRESIDENT', 'ADMIN', 'TREASURER', 'EVENT_ORGANIZER']),
  (req, res) => merchandiseController.createProduct(req, res)
);

merchandiseRouter.put(
  '/products/:id',
  requireRoles(['PRESIDENT', 'ADMIN', 'TREASURER', 'EVENT_ORGANIZER']),
  (req, res) => merchandiseController.updateProduct(req, res)
);

// Order fulfillment updates (Desk pickup handover)
merchandiseRouter.patch(
  '/orders/:id/status',
  requireRoles(['PRESIDENT', 'ADMIN', 'TREASURER', 'VOLUNTEER', 'EVENT_ORGANIZER']),
  (req, res) => merchandiseController.updateOrderStatus(req, res)
);
