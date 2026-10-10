import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Notification Module Tests', () => {
  it('GET /api/v1/notifications returns notifications list and unread count', async () => {
    const res = await request(app).get('/api/v1/notifications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(typeof res.body.unreadCount).toBe('number');
  });

  it('PATCH /api/v1/notifications/:id/read marks notification as read', async () => {
    const listRes = await request(app).get('/api/v1/notifications');
    const firstNotif = listRes.body.notifications[0];

    const res = await request(app).patch(`/api/v1/notifications/${firstNotif.id}/read`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.read).toBe(true);
  });

  it('POST /api/v1/notifications/mark-all-read marks all as read', async () => {
    const res = await request(app).post('/api/v1/notifications/mark-all-read');
    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBe(0);
  });

  it('POST /api/v1/notifications creates a new notification', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .send({
        title: 'New Emergency Broadcast',
        message: 'Campus power maintenance scheduled for 10 PM.',
        category: 'SYSTEM',
        priority: 'URGENT',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.title).toBe('New Emergency Broadcast');
    expect(res.body.notification.read).toBe(false);
  });
});
