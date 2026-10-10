import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { validateBody, validateQuery } from '../src/middleware/validate.middleware.js';
import { errorMiddleware } from '../src/middleware/error.middleware.js';

describe('Validation Middleware', () => {
  const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // Route validating body
    app.post('/api/members', validateBody(['fullName', 'email', 'studentId']), (req, res) => {
      res.status(201).json({ status: 'success', data: req.body });
    });

    // Route validating query
    app.get('/api/events', validateQuery(['category']), (req, res) => {
      res.status(200).json({ status: 'success', category: req.query.category });
    });

    app.use(errorMiddleware);
    return app;
  };

  const app = createTestApp();

  describe('validateBody', () => {
    it('returns 400 Bad Request when required body fields are missing', async () => {
      const res = await request(app)
        .post('/api/members')
        .send({ fullName: 'Alice Smith' }); // missing email and studentId

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Missing or empty required field');
      expect(res.body.details.missingFields).toContain('email');
      expect(res.body.details.missingFields).toContain('studentId');
    });

    it('returns 201 Created when all required body fields are supplied', async () => {
      const payload = {
        fullName: 'Alice Smith',
        email: 'alice@skyline.edu',
        studentId: 'STU-9921',
      };

      const res = await request(app).post('/api/members').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe('alice@skyline.edu');
    });
  });

  describe('validateQuery', () => {
    it('returns 400 when required query parameter is missing', async () => {
      const res = await request(app).get('/api/events');

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Missing query parameter');
      expect(res.body.details.missingParams).toContain('category');
    });

    it('returns 200 when required query parameter is present', async () => {
      const res = await request(app).get('/api/events?category=fundraiser');

      expect(res.status).toBe(200);
      expect(res.body.category).toBe('fundraiser');
    });
  });
});
