import { run } from './db';
import { createClient, isSupabaseConfigured } from './supabase/server';

/** Append a row to the audit log. Never throws on failure. */
export function recordAudit(
  userId: string | number | null,
  action: string,
  entity: string,
  entityId: number | null = null,
  details: string | Record<string, unknown> | null = null
): void {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      Promise.resolve(
        supabase
          .from('audit_logs')
          .insert({
            user_id: typeof userId === 'string' ? userId : null,
            action,
            entity,
            entity_id: entityId,
            details: (typeof details === 'object' ? details : details ? { message: details } : null) as any,
          })
      ).catch(() => {});
      return;
    }

    const detailStr =
      typeof details === 'object' && details !== null
        ? JSON.stringify(details)
        : details
          ? String(details)
          : null;
    run(
      'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      typeof userId === 'number' ? userId : null,
      action,
      entity,
      entityId,
      detailStr
    );
  } catch {
    // Audit logging must never break the primary flow.
  }
}