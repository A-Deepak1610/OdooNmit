import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Validates and exposes sanitized environment variables.
 */
const requiredEnvVars = ['DATABASE_URL'];

if (process.env.NODE_ENV !== 'test') {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn(`[WARN] Missing required environment variables: ${missing.join(', ')}. Ensure .env is properly configured.`);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('[WARN] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Google OAuth endpoints require these variables to authenticate users.');
  }

  if (!process.env.JWT_ACCESS_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_ACCESS_SECRET must be set in production mode.');
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'student-organization-system-backend',
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // JWT & Session Auth Configuration
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-jwt-access-secret-key-change-in-prod-32chars',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10),

  // Google OAuth 2.0 Credentials
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || (process.env.NODE_ENV === 'test' ? 'test-google-client-id' : ''),
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-google-client-secret' : ''),
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',

  // Client Web App Hand-off
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Razorpay Configuration
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};
