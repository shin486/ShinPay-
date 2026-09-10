'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setSalaryAction } from '@/lib/actions/employee-actions';
import { FormError } from '@/components/ui';

export function SalaryManager({
  employeeId,
  salaryType,
  basicRate,
  payrollFrequency,
  effectiveDate,
}: {
  employeeId: number;
  salaryType: string;
  basicRate: number;
  payrollFrequency: string;
  effectiveDate?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState({
    salary_type: salaryType || 'monthly',
    basic_rate: basicRate ? String(basicRate) : '',
    payroll_frequency: payrollFrequency || 'semi-monthly',
    effective_date: effectiveDate || '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await setSalaryAction(employeeId, {
        salary_type: v.salary_type,
        basic_rate: v.basic_rate,
        payroll_frequency: v.payroll_frequency,
        effective_date: v.effective_date || undefined,
      });
      if (res.ok) {
        setMsg('Salary updated. A new salary history record was created.');
        router.refresh();
      } else setError(res.error || 'Update failed.');
    });
  }

  return (
    <div>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="label">Salary Type</label>
          <select className="input" value={v.salary_type} onChange={(e) => setV({ ...v, salary_type: e.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>
        <div>
          <label className="label">Basic Salary / Rate</label>
          <input type="number" min="0" step="0.01" className="input" value={v.basic_rate} onChange={(e) => setV({ ...v, basic_rate: e.target.value })} required />
        </div>
        <div>
          <label className="label">Payroll Frequency</label>
          <select className="input" value={v.payroll_frequency} onChange={(e) => setV({ ...v, payroll_frequency: e.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="semi-monthly">Semi-Monthly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label className="label">Effective Date</label>
          <input type="date" className="input" value={v.effective_date} onChange={(e) => setV({ ...v, effective_date: e.target.value })} />
        </div>
        <div className="sm:col-span-2 md:col-span-4 flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Update Salary'}
          </button>
          {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        </div>
      </form>
      <div className="mt-2"><FormError error={error} /></div>
    </div>
  );
}