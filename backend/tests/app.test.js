import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Base Application Routes & Middlewares', () => {
  it('GET / returns 200 with server status message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Backend is running');
  });

  it('GET /healthz returns 200 with status ok', async () => {
    const res = await request(app).get('/healthz');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('attaches x-request-id header to every response', async () => {
    const res = await request(app).get('/');

    expect(res.headers).toHaveProperty('x-request-id');
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('preserves client-provided x-request-id header', async () => {
    const customId = 'client-custom-req-12345';
    const res = await request(app).get('/').set('x-request-id', customId);

    expect(res.headers['x-request-id']).toBe(customId);
  });
});
