import { cache } from 'react';
import { all, get, run } from './db';
import { createClient, isSupabaseConfigured } from './supabase/server';

export interface ModuleDefinition {
  id: string;
  label: string;
  description: string;
  category: 'core' | 'workforce' | 'compensation' | 'self_service';
  is_core: boolean;
  icon: string;
  enabled: boolean;
  enabled_at?: string | null;
}

/**
 * Returns all catalog modules with their per-organization enablement status.
 * Core modules are always enabled. (Sync / SQLite mode)
 */
export function getOrganizationModules(orgId: number): ModuleDefinition[] {
  try {
    const rows = all(
      `SELECT m.id, m.label, m.description, m.category, m.is_core, m.icon,
              COALESCE(om.enabled, CASE WHEN m.is_core = 1 THEN 1 ELSE 0 END) AS enabled,
              om.enabled_at
       FROM modules m
       LEFT JOIN organization_modules om 
         ON om.module_id = m.id AND om.organization_id = ?
       ORDER BY m.is_core DESC, m.category ASC, m.label ASC`,
      orgId
    );

    return rows.map((r) => ({
      id: String(r.id),
      label: String(r.label),
      description: String(r.description || ''),
      category: (r.category as ModuleDefinition['category']) || 'core',
      is_core: Number(r.is_core) === 1,
      icon: String(r.icon || 'Sparkles'),
      enabled: Number(r.enabled) === 1 || Number(r.is_core) === 1,
      enabled_at: r.enabled_at ? String(r.enabled_at) : null,
    }));
  } catch {
    return [];
  }
}

/**
 * Async version of getOrganizationModules that connects directly to Supabase when active (memoized per request).
 */
export const getOrganizationModulesAsync = cache(async function getOrganizationModulesAsync(orgId: number): Promise<ModuleDefinition[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const [{ data: modules }, { data: orgMods }] = await Promise.all([
        supabase
          .from('modules')
          .select('*')
          .order('is_core', { ascending: false }),
        supabase
          .from('organization_modules')
          .select('*')
          .eq('organization_id', orgId),
      ]);

      const map = new Map((orgMods || []).map((m) => [m.module_id, m]));

      return (modules || []).map((m) => {
        const orgMod = map.get(m.id);
        const isCore = Number(m.is_core) === 1;
        const enabled = isCore || Boolean(orgMod?.enabled === 1);
        return {
          id: m.id,
          label: m.label,
          description: m.description || '',
          category: (m.category as ModuleDefinition['category']) || 'core',
          is_core: isCore,
          icon: m.icon || 'Sparkles',
          enabled,
          enabled_at: orgMod?.enabled_at ?? null,
        };
      });
    } catch (e) {
      console.error('Error in getOrganizationModulesAsync:', e);
    }
  }

  return getOrganizationModules(orgId);
});

/**
 * Fast Boolean check to determine if an organization has access to a specific module.
 */
export function isModuleEnabled(orgId: number, moduleId: string): boolean {
  try {
    const mod = get('SELECT is_core FROM modules WHERE id = ?', moduleId) as
      | { is_core: number }
      | undefined;

    if (mod && Number(mod.is_core) === 1) {
      return true;
    }

    const row = get(
      'SELECT enabled FROM organization_modules WHERE organization_id = ? AND module_id = ?',
      orgId,
      moduleId
    ) as { enabled: number } | undefined;

    return row ? Number(row.enabled) === 1 : false;
  } catch {
    return true; // fail-open for core features if table missing
  }
}

/**
 * Async check for module enablement supporting Supabase.
 */
export async function isModuleEnabledAsync(orgId: number, moduleId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: mod } = await supabase
        .from('modules')
        .select('is_core')
        .eq('id', moduleId)
        .maybeSingle();

      if (mod && Number(mod.is_core) === 1) return true;

      const { data: orgMod } = await supabase
        .from('organization_modules')
        .select('enabled')
        .eq('organization_id', orgId)
        .eq('module_id', moduleId)
        .maybeSingle();

      return Boolean(orgMod && orgMod.enabled === 1);
    } catch {
      return true;
    }
  }

  return isModuleEnabled(orgId, moduleId);
}

/**
 * Returns a simple string list of all active module IDs for an organization.
 */
export function getEnabledModuleIds(orgId: number): string[] {
  const mods = getOrganizationModules(orgId);
  return mods.filter((m) => m.enabled).map((m) => m.id);
}

/**
 * Async version of getEnabledModuleIds (memoized per request).
 */
export const getEnabledModuleIdsAsync = cache(async function getEnabledModuleIdsAsync(orgId: number): Promise<string[]> {
  const mods = await getOrganizationModulesAsync(orgId);
  return mods.filter((m) => m.enabled).map((m) => m.id);
});

/**
 * Server-side guard: throws an authorization error if the organization
 * does not have the specified module enabled.
 */
export async function requireModule(orgId: number, moduleId: string): Promise<void> {
  const enabled = await isModuleEnabledAsync(orgId, moduleId);
  if (!enabled) {
    throw new Error(
      `FORBIDDEN_MODULE: Feature '${moduleId}' is not enabled for organization #${orgId}.`
    );
  }
}
