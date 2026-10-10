import { asyncHandler } from '../../utils/async-handler.js';
import { healthService } from './health.service.js';

export const healthController = {
  /**
   * GET /api/v1/health/live
   */
  getLive: asyncHandler(async (req, res) => {
    const data = healthService.getLiveness();
    res.status(200).json(data);
  }),

  /**
   * GET /api/v1/health/ready
   */
  getReady: asyncHandler(async (req, res) => {
    const data = await healthService.getReadiness();
    res.status(200).json(data);
  }),

  /**
   * GET /api/v1/health
   */
  getSummary: asyncHandler(async (req, res) => {
    const data = await healthService.getHealthSummary();
    const statusCode = data.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(data);
  }),
};
