import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { userRepository } from '../src/modules/users/user.repository.js';
import { signAccessToken, hashToken, generateRawRefreshToken } from '../src/utils/token.utils.js';

describe('Auth & Role Module Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/auth/google', () => {
    it('returns the Google OAuth authorization URL as JSON', async () => {
      const response = await request(app).get('/api/v1/auth/google');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('authUrl');
      expect(response.body.data.authUrl).toContain('accounts.google.com/o/oauth2/v2/auth');
      expect(response.body.data.authUrl).toContain('openid');
      expect(response.body.data.authUrl).toContain('email');
      expect(response.body.data.authUrl).toContain('profile');
    });

    it('redirects to Google when redirect=true is passed', async () => {
      const response = await request(app).get('/api/v1/auth/google?redirect=true');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('accounts.google.com/o/oauth2/v2/auth');
    });
  });

  describe('GET /api/v1/auth/google/callback', () => {
    it('returns 400 when authorization code is missing', async () => {
      const response = await request(app).get('/api/v1/auth/google/callback');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Authorization code missing');
    });

    it('creates new user with default STUDENT role on first sign in', async () => {
      const mockGoogleSub = 'google-sub-12345';
      const mockGoogleEmail = 'student@campus.edu';

      // Mock Google fetch responses
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock-google-access-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: mockGoogleSub,
            email: mockGoogleEmail,
            email_verified: true,
            name: 'Alex Rivera',
            picture: 'https://example.com/avatar.jpg',
          }),
        });

      // User does not exist yet
      vi.spyOn(authRepository, 'findOAuthAccount').mockResolvedValueOnce(null);

      // Mock creation returning user with default STUDENT role
      vi.spyOn(authRepository, 'createOAuthUserWithAccount').mockResolvedValueOnce({
        id: 'user-uuid-1',
        name: 'Alex Rivera',
        email: mockGoogleEmail,
        avatarUrl: 'https://example.com/avatar.jpg',
        status: 'ACTIVE',
        roles: [{ id: 'role-1', role: 'STUDENT', userId: 'user-uuid-1' }],
      });

      vi.spyOn(authRepository, 'createRefreshToken').mockResolvedValueOnce({
        id: 'session-1',
      });

      const response = await request(app).get('/api/v1/auth/google/callback?code=valid-auth-code');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.roles).toEqual(['STUDENT']);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('preserves existing privileged roles on subsequent sign in without overwriting', async () => {
      const mockGoogleSub = 'google-sub-existing';

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock-google-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: mockGoogleSub,
            email: 'president@campus.edu',
            email_verified: true,
            name: 'President Pat',
          }),
        });

      // Existing user with PRESIDENT and ADMIN roles
      vi.spyOn(authRepository, 'findOAuthAccount').mockResolvedValueOnce({
        id: 'oauth-1',
        provider: 'google',
        providerAccountId: mockGoogleSub,
        user: {
          id: 'existing-president-id',
          name: 'President Pat',
          email: 'president@campus.edu',
          status: 'ACTIVE',
          roles: [
            { id: 'r1', role: 'STUDENT', userId: 'existing-president-id' },
            { id: 'r2', role: 'PRESIDENT', userId: 'existing-president-id' },
          ],
        },
      });

      vi.spyOn(authRepository, 'createRefreshToken').mockResolvedValueOnce({ id: 'session-2' });

      const response = await request(app).get('/api/v1/auth/google/callback?code=existing-user-code');

      expect(response.status).toBe(200);
      expect(response.body.data.user.roles).toContain('STUDENT');
      expect(response.body.data.user.roles).toContain('PRESIDENT');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns 400 when refreshToken body is missing', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('refreshToken is required');
    });

    it('rotates valid refresh token and issues new tokens', async () => {
      const rawToken = generateRawRefreshToken();
      const rawTokenHash = hashToken(rawToken);

      vi.spyOn(authRepository, 'findRefreshToken').mockResolvedValueOnce({
        id: 'tok-1',
        tokenHash: rawTokenHash,
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400 * 1000 * 7),
        revokedAt: null,
        user: {
          id: 'user-123',
          email: 'student@campus.edu',
          name: 'Student User',
          status: 'ACTIVE',
          roles: [{ role: 'STUDENT' }, { role: 'MEMBER' }],
        },
      });

      vi.spyOn(authRepository, 'revokeRefreshToken').mockResolvedValueOnce({});
      vi.spyOn(authRepository, 'createRefreshToken').mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.refreshToken).not.toEqual(rawToken);
      expect(response.body.data.user.roles).toEqual(['STUDENT', 'MEMBER']);
    });

    it('rejects revoked tokens with 401 (reuse detection)', async () => {
      const rawToken = generateRawRefreshToken();

      vi.spyOn(authRepository, 'findRefreshToken').mockResolvedValueOnce({
        id: 'tok-revoked',
        tokenHash: hashToken(rawToken),
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: new Date(),
        user: { id: 'user-123', status: 'ACTIVE', roles: [] },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('revoked');
    });

    it('rejects expired tokens with 401', async () => {
      const rawToken = generateRawRefreshToken();

      vi.spyOn(authRepository, 'findRefreshToken').mockResolvedValueOnce({
        id: 'tok-expired',
        tokenHash: hashToken(rawToken),
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 5000), // in the past
        revokedAt: null,
        user: { id: 'user-123', status: 'ACTIVE', roles: [] },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('expired');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes session successfully', async () => {
      const rawToken = generateRawRefreshToken();

      vi.spyOn(authRepository, 'findRefreshToken').mockResolvedValueOnce({
        id: 'tok-logout',
        tokenHash: hashToken(rawToken),
        revokedAt: null,
      });
      vi.spyOn(authRepository, 'revokeRefreshToken').mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: rawToken });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('GET /api/v1/auth/me (Protected Route)', () => {
    it('returns 401 when no Bearer token is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Authentication required');
    });

    it('returns 200 with authenticated user and roles when valid JWT is supplied', async () => {
      const token = signAccessToken({
        sub: 'user-test-uuid',
        email: 'member@campus.edu',
        name: 'Member Jordan',
        roles: ['STUDENT', 'MEMBER'],
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('id', 'user-test-uuid');
      expect(response.body.data.user.roles).toEqual(['STUDENT', 'MEMBER']);
    });
  });

  describe('Role-based RBAC & Role Management', () => {
    it('forbids assigning roles if caller does not have ADMIN or PRESIDENT role', async () => {
      // Normal STUDENT caller
      const studentToken = signAccessToken({
        sub: 'student-caller',
        roles: ['STUDENT'],
      });

      const response = await request(app)
        .post('/api/v1/users/target-user/roles')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ role: 'EVENT_ORGANIZER' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Insufficient privileges');
    });

    it('allows ADMIN or PRESIDENT to assign a valid role', async () => {
      const adminToken = signAccessToken({
        sub: 'admin-caller',
        roles: ['ADMIN'],
      });

      vi.spyOn(userRepository, 'findById').mockResolvedValueOnce({
        id: 'target-user',
        name: 'Target User',
        roles: [{ role: 'STUDENT' }],
      });
      vi.spyOn(userRepository, 'assignRole').mockResolvedValueOnce({});
      vi.spyOn(userRepository, 'getUserRoles').mockResolvedValueOnce(['STUDENT', 'VOLUNTEER']);

      const response = await request(app)
        .post('/api/v1/users/target-user/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'VOLUNTEER' });

      expect(response.status).toBe(200);
      expect(response.body.data.roles).toEqual(['STUDENT', 'VOLUNTEER']);
    });
  });
});
