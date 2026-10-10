import { Router } from 'express';
import { healthController } from './health.controller.js';

const router = Router();

// Liveness probe (no external dependency)
router.get('/live', healthController.getLive);

// Readiness probe (verifies database availability)
router.get('/ready', healthController.getReady);

// Concise health summary
router.get('/', healthController.getSummary);

export default router;
