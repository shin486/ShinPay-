import { all, get, run } from './db';
import { createClient, isSupabaseConfigured } from './supabase/server';

export type SettingsMap = Record<string, string>;

/** Load all settings into a plain object (sync / SQLite fallback). */
export function getSettings(): SettingsMap {
  try {
    const rows = all('SELECT key, value FROM settings');
    const map: SettingsMap = {};
    for (const row of rows) {
      map[String(row.key)] = row.value == null ? '' : String(row.value);
    }
    return map;
  } catch {
    return {
      system_name: 'ShinPay+ Workforce & Payroll OS',
      currency_symbol: '₱',
      sss_rate: '0',
      philhealth_rate: '0',
      pagibig_amount: '0',
      tax_rate: '0',
    };
  }
}

/** Async loader for settings supporting Supabase. */
export async function getSettingsAsync(): Promise<SettingsMap> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: rows } = await supabase.from('settings').select('*');
      const map: SettingsMap = {};
      for (const row of rows || []) {
        map[row.key] = row.value ?? '';
      }
      return map;
    } catch (e) {
      console.error('Error in getSettingsAsync:', e);
    }
  }

  return getSettings();
}

export function getSetting(key: string, fallback = ''): string {
  try {
    const row = get('SELECT value FROM settings WHERE key = ?', key);
    return row && row.value != null ? String(row.value) : fallback;
  } catch {
    return fallback;
  }
}

/** Update one or many settings, preserving unspecified keys. */
export async function updateSettings(entries: Record<string, string>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      for (const [key, value] of Object.entries(entries)) {
        await supabase
          .from('settings')
          .upsert({ key, value: String(value) });
      }
      return;
    } catch (e) {
      console.error('Error updating settings in Supabase:', e);
    }
  }

  for (const [key, value] of Object.entries(entries)) {
    run(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      String(value)
    );
  }
}

export function currencySymbolFrom(settings: SettingsMap): string {
  return settings.currency_symbol || '\u20B1';
}