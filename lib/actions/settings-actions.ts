'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../auth';
import { recordAudit } from '../audit';
import { updateSettings } from '../settings';
import { notNegative } from '../validators';
import { init } from '../init';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface SettingsInput {
  system_name?: string;
  currency_symbol?: string;
  sss_rate?: string | number;
  philhealth_rate?: string | number;
  pagibig_amount?: string | number;
  tax_rate?: string | number;
}

export async function updateSettingsAction(input: SettingsInput): Promise<ActionResult> {
  const user = await requireUser();

  const errs: Array<string | null> = [
    notNegative(input.sss_rate ?? '', 'SSS rate (%)'),
    notNegative(input.philhealth_rate ?? '', 'PhilHealth rate (%)'),
    notNegative(input.pagibig_amount ?? '', 'Pag-IBIG monthly amount'),
    notNegative(input.tax_rate ?? '', 'Withholding tax rate (%)'),
  ];
  for (const e of errs) if (e) return { ok: false, error: e };

  await updateSettings({
    system_name: input.system_name?.trim() || 'ShinPay+ Workforce & Payroll OS',
    currency_symbol: input.currency_symbol?.trim() || '₱',
    sss_rate: String(input.sss_rate ?? 0),
    philhealth_rate: String(input.philhealth_rate ?? 0),
    pagibig_amount: String(input.pagibig_amount ?? 0),
    tax_rate: String(input.tax_rate ?? 0),
  });
  recordAudit(user.id, 'SETTINGS_UPDATED', 'settings', null, null);
  revalidatePath('/app/settings');
  revalidatePath('/');
  return { ok: true };
}