import { env } from '../config/env.js';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CampusMitra API Documentation',
    version: '1.0.0',
    description:
      'Interactive API documentation for CampusMitra modular monolith platform. Includes Authentication, Role-based Access Control (RBAC), User Management, and Health probes.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token (obtained from login/refresh)',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation error description' },
          requestId: { type: 'string', example: 'b09d1234-5678-...' },
          timestamp: { type: 'string', example: '2026-10-10T11:00:00.000Z' },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'c1234567-89ab-cdef-0123-456789abcdef' },
          name: { type: 'string', example: 'Deepak Kumar' },
          email: { type: 'string', example: 'deepak@campusmitra.edu' },
          avatarUrl: { type: 'string', example: 'https://lh3.googleusercontent.com/a/...' },
          status: { type: 'string', example: 'ACTIVE' },
          roles: {
            type: 'array',
            items: { type: 'string', enum: ['STUDENT', 'MEMBER', 'VOLUNTEER', 'EVENT_ORGANIZER', 'TREASURER', 'PRESIDENT', 'ADMIN'] },
            example: ['STUDENT'],
          },
          oauthProviders: {
            type: 'array',
            items: { type: 'string' },
            example: ['google'],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          refreshToken: { type: 'string', example: '6c4598a287bf9...' },
          user: { $ref: '#/components/schemas/UserResponse' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: '6c4598a287bf9...' },
        },
      },
      AssignRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: ['STUDENT', 'MEMBER', 'VOLUNTEER', 'EVENT_ORGANIZER', 'TREASURER', 'PRESIDENT', 'ADMIN'],
            example: 'VOLUNTEER',
          },
        },
      },
    },
  },
  paths: {
    // -------------------------------------------------------------------------
    // Health Checks
    // -------------------------------------------------------------------------
    '/api/v1/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Service Liveness Probe',
        description: 'Returns 200 OK without querying the database to verify the process is alive.',
        responses: {
          200: { description: 'Process is live' },
        },
      },
    },
    '/api/v1/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Database Readiness Probe',
        description: 'Pings TiDB MySQL connection. Returns 503 if unreachable.',
        responses: {
          200: { description: 'Database connected and ready' },
          503: { description: 'Database connection failed' },
        },
      },
    },
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'System Health Summary',
        description: 'Reports overall system status, uptime, and database latency.',
        responses: {
          200: { description: 'Healthy' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------
    '/api/v1/auth/google': {
      get: {
        tags: ['Authentication'],
        summary: 'Initiate Google OAuth Flow',
        description: 'Returns the Google OAuth 2.0 authorization URL or redirects directly with ?redirect=true.',
        parameters: [
          {
            name: 'redirect',
            in: 'query',
            description: 'Set to "true" to automatically redirect browser to Google consent screen',
            schema: { type: 'string', example: 'true' },
          },
          {
            name: 'state',
            in: 'query',
            description: 'Optional custom state parameter for OAuth roundtrip',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Authorization URL generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        authUrl: { type: 'string', example: 'https://accounts.google.com/o/oauth2/v2/auth?...' },
                      },
                    },
                  },
                },
              },
            },
          },
          302: { description: 'Redirected to Google OAuth' },
        },
      },
    },
    '/api/v1/auth/google/callback': {
      get: {
        tags: ['Authentication'],
        summary: 'Google OAuth Callback',
        description: 'Callback endpoint invoked by Google OAuth redirect. Exchanges code for verified profile, creates student account with STUDENT role, issues tokens.',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            description: 'Google authorization code',
            schema: { type: 'string' },
          },
          {
            name: 'state',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Authenticated successfully with tokens and user info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          302: { description: 'Redirects to frontend callback URL with token query params' },
          400: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh Access Token (With Token Rotation)',
        description: 'Validates refresh token, revokes it, and issues a new access token and rotated refresh token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Tokens successfully refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid, revoked, or expired refresh token' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke Refresh Token Session (Logout)',
        description: 'Revokes the presented refresh token session in the database.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Authenticated User Profile & Roles',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile and roles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized — missing or invalid Bearer token' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // Users & Roles
    // -------------------------------------------------------------------------
    '/api/v1/users/me': {
      get: {
        tags: ['Users & Roles'],
        summary: 'Get My Profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users & Roles'],
        summary: 'Get User Profile by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User UUID',
          },
        ],
        responses: {
          200: { description: 'User found' },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/v1/users/{id}/roles': {
      get: {
        tags: ['Users & Roles'],
        summary: 'List Roles for User',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Array of role names for the user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string' },
                        roles: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['STUDENT', 'MEMBER'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users & Roles'],
        summary: 'Assign Role to User',
        description: 'Restricted to ADMIN and PRESIDENT roles.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignRoleRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Role assigned successfully' },
          403: { description: 'Forbidden — Insufficient privileges' },
        },
      },
    },
    '/api/v1/users/{id}/roles/{role}': {
      delete: {
        tags: ['Users & Roles'],
        summary: 'Remove Role from User',
        description: 'Restricted to ADMIN and PRESIDENT roles.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'role',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['STUDENT', 'MEMBER', 'VOLUNTEER', 'EVENT_ORGANIZER', 'TREASURER', 'PRESIDENT', 'ADMIN'],
            },
          },
        ],
        responses: {
          200: { description: 'Role removed successfully' },
          403: { description: 'Forbidden — Insufficient privileges' },
        },
      },
    },
  },
  responses: {
    Error: {
      description: 'Standard operational error response',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
  },
};
