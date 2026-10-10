import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const googleTokenSchema = z.object({
  idToken: z.string().min(10, 'Google ID token is required'),
});

export const switchRoleSchema = z.object({
  role: z.enum(['ADMIN', 'PRESIDENT', 'TREASURER', 'EVENT_ORGANIZER', 'VOLUNTEER', 'MEMBER', 'STUDENT']),
});
