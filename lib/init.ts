import { isSupabaseConfigured } from './supabase/server';

let initialized = false;

/**
 * Ensure the schema and initial admin exist. Safe to call multiple times.
 * In cloud production environments (Supabase configured), local SQLite initialization is bypassed.
 */
export function init(): void {
  if (initialized) return;

  // If Supabase is configured (e.g. on Vercel), do not run local SQLite schema
  if (isSupabaseConfigured()) {
    initialized = true;
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createSchema, ensureAdminUser } = require('./schema');
    createSchema();
    ensureAdminUser({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      displayName: process.env.ADMIN_NAME || 'Administrator',
      passwordHash: process.env.ADMIN_PASSWORD_HASH,
    });
  } catch (err) {
    console.warn('SQLite init skipped or unavailable:', err);
  }

  initialized = true;
}