import { Request, Response } from 'express';
import { merchandiseService } from './merchandise.service.js';

const getUserId = (req: Request): string => {
  const user = (req as any).user;
  return user?.userId || user?.id || '';
};

const getUserEmail = (req: Request): string => {
  const user = (req as any).user;
  return user?.email || (req.query.userEmail as string) || '';
};

export class MerchandiseController {
  async getProducts(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      const userEmail = getUserEmail(req);
      const data = await merchandiseService.getProducts(
        organizationId as string | undefined,
        userEmail || undefined
      );
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await merchandiseService.getProductById(id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const data = await merchandiseService.createProduct(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Merchandise product and stock specification created successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await merchandiseService.updateProduct(id, req.body);
      res.json({
        success: true,
        data,
        message: 'Product stock and specifications updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async placeOrder(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required to place order.' });
      }
      const data = await merchandiseService.placeOrder(userId, req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Order placed successfully! Present your pickup QR pass at the club desk.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMyOrders(req: Request, res: Response) {
    try {
      const userEmail = getUserEmail(req);
      if (!userEmail) {
        return res.status(400).json({ success: false, message: 'User email required to retrieve orders.' });
      }
      const data = await merchandiseService.getMyOrders(userEmail);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMerchandiseAnalytics(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      const data = await merchandiseService.getMerchandiseAnalytics(organizationId as string | undefined);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getEventFinanceRecord(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      const data = await merchandiseService.getEventFinanceRecord(organizationId as string | undefined);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, handoverBy } = req.body;
      const user = (req as any).user;
      const officer = handoverBy || user?.name || user?.fullName || 'Campus Lead Officer';
      const data = await merchandiseService.updateOrderStatus(id, status, officer);
      res.json({
        success: true,
        data,
        message: `Order fulfillment status updated to ${status}.`,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const merchandiseController = new MerchandiseController();
