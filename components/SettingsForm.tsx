'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsAction } from '@/lib/actions/settings-actions';
import { FormError } from '@/components/ui';

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState({
    system_name: settings.system_name || 'RA Payroll System',
    currency_symbol: settings.currency_symbol || '\u20B1',
    sss_rate: settings.sss_rate || '0',
    philhealth_rate: settings.philhealth_rate || '0',
    pagibig_amount: settings.pagibig_amount || '0',
    tax_rate: settings.tax_rate || '0',
  });

  function set(name: keyof typeof v) {
    return (value: string) => setV((prev) => ({ ...prev, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMsg(null);
    startTransition(async () => {
      const res = await updateSettingsAction(v);
      if (res.ok) { setMsg('Settings saved.'); router.refresh(); }
      else setError(res.error || 'Save failed.');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">System Name</label>
          <input className="input" value={v.system_name} onChange={(e) => set('system_name')(e.target.value)} />
        </div>
        <div>
          <label className="label">Currency Symbol</label>
          <input className="input" value={v.currency_symbol} onChange={(e) => set('currency_symbol')(e.target.value)} />
        </div>
        <div className="sm:col-span-2 border-t border-[var(--border)] pt-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Philippine Statutory / Default Withholding Rates</p>
          <p className="text-xs text-[var(--text-muted)]">These baseline global rates apply when an employee has no explicit custom tier override. Baseline statutory brackets (SSS 2024 MSC, PhilHealth 5%, Pag-IBIG ₱200 cap) are automatically computed according to Republic Acts.</p>
        </div>
        <div>
          <label className="label">SSS rate (%)</label>
          <input type="number" step="0.01" min="0" className="input" value={v.sss_rate} onChange={(e) => set('sss_rate')(e.target.value)} />
        </div>
        <div>
          <label className="label">PhilHealth rate (%)</label>
          <input type="number" step="0.01" min="0" className="input" value={v.philhealth_rate} onChange={(e) => set('philhealth_rate')(e.target.value)} />
        </div>
        <div>
          <label className="label">Pag-IBIG monthly (fixed)</label>
          <input type="number" step="0.01" min="0" className="input" value={v.pagibig_amount} onChange={(e) => set('pagibig_amount')(e.target.value)} />
        </div>
        <div>
          <label className="label">Withholding tax rate (%)</label>
          <input type="number" step="0.01" min="0" className="input" value={v.tax_rate} onChange={(e) => set('tax_rate')(e.target.value)} />
        </div>
      </div>
      <FormError error={error} />
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save Settings'}</button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </div>
    </form>
  );
}