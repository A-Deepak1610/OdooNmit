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
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'hackathon-starter-backend',
  DATABASE_URL: process.env.DATABASE_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};
