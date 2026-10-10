import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as databaseModule from '../src/config/database.js';

describe('Health Module Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/health/live', () => {
    it('returns 200 OK with liveness details without querying the database', async () => {
      const response = await request(app).get('/api/v1/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptimeSeconds');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.headers).toHaveProperty('x-request-id');
    });
  });

  describe('GET /api/v1/health/ready', () => {
    it('returns 200 OK when database connection check succeeds', async () => {
      vi.spyOn(databaseModule, 'checkDatabaseConnection').mockResolvedValueOnce({
        ok: true,
        latencyMs: 12,
      });

      const response = await request(app).get('/api/v1/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body.database).toHaveProperty('status', 'connected');
      expect(response.body.database).toHaveProperty('latencyMs', 12);
    });

    it('returns 503 Service Unavailable when database connection check fails', async () => {
      vi.spyOn(databaseModule, 'checkDatabaseConnection').mockRejectedValueOnce(
        new Error('Connection refused')
      );

      const response = await request(app).get('/api/v1/health/ready');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Service unavailable');
      expect(response.body.details).toEqual({ database: 'disconnected' });
    });
  });

  describe('GET /api/v1/health (Summary)', () => {
    it('returns 200 with status "healthy" when database is reachable', async () => {
      vi.spyOn(databaseModule, 'checkDatabaseConnection').mockResolvedValueOnce({
        ok: true,
        latencyMs: 15,
      });

      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body.checks.database.status).toBe('connected');
    });

    it('returns 503 with status "degraded" when database is unreachable', async () => {
      vi.spyOn(databaseModule, 'checkDatabaseConnection').mockRejectedValueOnce(
        new Error('Timeout')
      );

      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'degraded');
      expect(response.body.checks.database.status).toBe('disconnected');
    });
  });

  describe('404 Not Found Middleware', () => {
    it('returns 404 for nonexistent routes with safe standardized JSON', async () => {
      const response = await request(app).get('/api/v1/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('Resource not found');
    });
  });
});
