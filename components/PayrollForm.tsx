'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPayrollAction } from '@/lib/actions/payroll-actions';
import { FormError } from '@/components/ui';

const FREQUENCIES = ['monthly', 'semi-monthly', 'bi-weekly', 'weekly'];

export function PayrollForm({ businesses }: { businesses: { id: number; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState({
    business_id: '',
    payroll_period_start: '',
    payroll_period_end: '',
    pay_date: '',
    payroll_frequency: 'semi-monthly',
  });

  function set(name: keyof typeof v) {
    return (value: string) => setV((prev) => ({ ...prev, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPayrollAction(v);
      if (res.ok && res.id) router.push(`/app/payroll/${res.id}`);
      else setError(res.error || 'Unable to create payroll.');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="label" htmlFor="business">Business</label>
          <select id="business" className="input" value={v.business_id} onChange={(e) => set('business_id')(e.target.value)} required>
            <option value="">Select business…</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="period_start">Payroll Period Start</label>
            <input id="period_start" type="date" className="input" value={v.payroll_period_start} onChange={(e) => set('payroll_period_start')(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="period_end">Payroll Period End</label>
            <input id="period_end" type="date" className="input" value={v.payroll_period_end} onChange={(e) => set('payroll_period_end')(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="pay_date">Pay Date</label>
            <input id="pay_date" type="date" className="input" value={v.pay_date} onChange={(e) => set('pay_date')(e.target.value)} required />
          </div>
        </div>
        <div className="sm:max-w-xs">
          <label className="label" htmlFor="frequency">Payroll Frequency</label>
          <select id="frequency" className="input" value={v.payroll_frequency} onChange={(e) => set('payroll_frequency')(e.target.value)}>
            {FREQUENCIES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        After creating the payroll, you will be able to calculate salaries, review, and finalize it.
      </p>
      <FormError error={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Creating…' : 'Create Payroll'}
        </button>
      </div>
    </form>
  );
}