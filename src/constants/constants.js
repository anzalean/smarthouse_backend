import path from 'node:path';
import { env } from '../utils/env.js';

export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const CLOUDINARY = {
  CLOUD_NAME: env('CLOUD_NAME'),
  API_KEY: env('API_KEY'),
  API_SECRET: env('API_SECRET'),
};

export const SMTP = {
  SMTP_HOST: env('SMTP_HOST'),
  SMTP_PORT: env('SMTP_PORT'),
  SMTP_USER: env('SMTP_USER'),
  SMTP_PASSWORD: env('SMTP_PASSWORD'),
  SMTP_FROM: env('SMTP_FROM'),
};

// Token lifetimes in milliseconds
export const ACCESS_TOKEN_LIFETIME_MS = 1000 * 60 * 15; // 15 minutes
export const REFRESH_TOKEN_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
export const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Token expiry strings for JWT
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

// Cookie settings
export const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: env('NODE_ENV') === 'production',
  sameSite: 'lax',
  path: '/',
};

// User statuses
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  DELETED: 'deleted',
};

// Session statuses
export const SESSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

// Auth settings
export const AUTH = {
  JWT_SECRET: env('JWT_SECRET'),
  APP_DOMAIN: env('APP_DOMAIN'),
  GOOGLE_AUTH: {
    CLIENT_ID: env('GOOGLE_AUTH_CLIENT_ID'),
    CLIENT_SECRET: env('GOOGLE_AUTH_CLIENT_SECRET'),
    REDIRECT_URL: env('GOOGLE_AUTH_REDIRECT_URL'),
  },
};

export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');
