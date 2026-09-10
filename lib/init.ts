import { createSchema, ensureAdminUser } from './schema';

let initialized = false;

/**
 * Ensure the schema and initial admin exist. Safe to call multiple times.
 * Runs synchronously at server startup.
 */
export function init(): void {
  if (initialized) return;
  createSchema();
  ensureAdminUser({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    displayName: process.env.ADMIN_NAME || 'Administrator',
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  });
  initialized = true;
}