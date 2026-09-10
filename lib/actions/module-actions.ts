'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { get, run } from '@/lib/db';
import { recordAudit } from '@/lib/audit';
import { init } from '@/lib/init';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Toggle an optional module on or off for the caller's active organization.
 * Protected: Only Owners and Administrators can modify feature modules.
 * Core modules are permanently protected from being disabled.
 */
export async function toggleModuleAction(
  moduleId: string,
  enabled: boolean
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'You must be signed in to modify feature settings.' };
  }

  const orgId = user.organization_id;
  if (!orgId) {
    return { ok: false, error: 'No active organization workspace found.' };
  }

  // Authorization check: Owner or Admin only
  const role = (user.organization_role || user.role || '').toLowerCase();
  if (role !== 'owner' && role !== 'admin') {
    return {
      ok: false,
      error: 'Unauthorized: Only Organization Owners or Administrators may toggle feature modules.',
    };
  }

  // 1. Supabase logic
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: mod } = await supabase
        .from('modules')
        .select('id, label, is_core')
        .eq('id', moduleId)
        .single();

      if (!mod) {
        return { ok: false, error: `Module '${moduleId}' does not exist in the system catalog.` };
      }

      if (Number(mod.is_core) === 1 && !enabled) {
        return {
          ok: false,
          error: `Module '${mod.label}' is a foundational core module and cannot be deactivated.`,
        };
      }

      const now = new Date().toISOString();
      const isEnabledNum = enabled ? 1 : 0;

      const { data: existing } = await supabase
        .from('organization_modules')
        .select('id')
        .eq('organization_id', orgId)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('organization_modules')
          .update({
            enabled: isEnabledNum,
            enabled_at: enabled ? now : null,
            updated_at: now,
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('organization_modules').insert({
          organization_id: orgId,
          module_id: moduleId,
          enabled: isEnabledNum,
          enabled_at: enabled ? now : null,
          updated_at: now,
        });
      }

      recordAudit(
        user.id,
        enabled ? 'MODULE_ENABLED' : 'MODULE_DISABLED',
        'organization_module',
        orgId,
        { moduleId, label: mod.label, enabled }
      );

      revalidatePath('/app');
      revalidatePath('/app/settings');
      return { ok: true };
    } catch (err) {
      console.error('Failed to toggle Supabase module:', err);
      return { ok: false, error: 'Failed to update module state. Please try again.' };
    }
  }

  // 2. SQLite fallback
  init();
  const mod = get('SELECT id, label, is_core FROM modules WHERE id = ?', moduleId) as
    | { id: string; label: string; is_core: number }
    | undefined;

  if (!mod) {
    return { ok: false, error: `Module '${moduleId}' does not exist in the system catalog.` };
  }

  if (Number(mod.is_core) === 1 && !enabled) {
    return {
      ok: false,
      error: `Module '${mod.label}' is a foundational core module and cannot be deactivated.`,
    };
  }

  try {
    const existing = get(
      'SELECT id FROM organization_modules WHERE organization_id = ? AND module_id = ?',
      orgId,
      moduleId
    );

    const now = new Date().toISOString();
    const isEnabledNum = enabled ? 1 : 0;

    if (existing) {
      run(
        `UPDATE organization_modules 
         SET enabled = ?, enabled_at = ?, updated_at = datetime('now')
         WHERE organization_id = ? AND module_id = ?`,
        isEnabledNum,
        enabled ? now : null,
        orgId,
        moduleId
      );
    } else {
      run(
        `INSERT INTO organization_modules (organization_id, module_id, enabled, enabled_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        orgId,
        moduleId,
        isEnabledNum,
        enabled ? now : null
      );
    }

    recordAudit(
      user.id,
      enabled ? 'MODULE_ENABLED' : 'MODULE_DISABLED',
      'organization_module',
      orgId,
      { moduleId, label: mod.label, enabled }
    );

    revalidatePath('/app');
    revalidatePath('/app/settings');
    return { ok: true };
  } catch (err) {
    console.error('Failed to toggle module:', err);
    return { ok: false, error: 'Failed to update module state. Please try again.' };
  }
}
