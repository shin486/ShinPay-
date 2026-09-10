'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/format';
import { FormError, Badge } from '@/components/ui';
import {
  addDeductionAction,
  deleteDeductionAction,
  toggleDeductionStatusAction,
} from '@/lib/actions/employee-actions';

export type DeductionRow = {
  id: number;
  name: string;
  amount: number;
  calculation_type: string;
  frequency: string;
  status: string;
};

export function DeductionsManager({
  employeeId,
  types,
  deductions,
  symbol,
}: {
  employeeId: number;
  types: { id: number; name: string }[];
  deductions: DeductionRow[];
  symbol: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [calc, setCalc] = useState('fixed');
  const [freq, setFreq] = useState('monthly');

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.ok) {
        setType(''); setAmount(''); setCalc('fixed'); setFreq('monthly');
        router.refresh();
      } else setError(res.error || 'Action failed.');
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() =>
      addDeductionAction(employeeId, {
        deduction_type_id: type,
        amount,
        calculation_type: calc,
        frequency: freq,
      })
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="grid grid-cols-2 gap-2 sm:grid-cols-5 items-end">
        <div className="col-span-2">
          <label className="label">Deduction Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select…</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div><label className="label">Amount / %</label><input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" /></div>
        <div><label className="label">Type</label><select className="input" value={calc} onChange={(e) => setCalc(e.target.value)}><option value="fixed">Fixed</option><option value="percentage">% of Gross</option></select></div>
        <div><label className="label">&nbsp;</label><button type="submit" className="btn-primary w-full" disabled={pending}>Add</button></div>
      </form>
      <FormError error={error} />
      {deductions.length === 0 ? (
        <p className="text-xs text-slate-400">No deductions configured.</p>
      ) : (
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <tbody className="divide-y divide-slate-100">
            {deductions.map((d) => (
              <tr key={d.id}>
                <td className="py-2 font-medium text-slate-700">{d.name}</td>
                <td className="py-2 text-right text-slate-600">
                  {d.calculation_type === 'percentage' ? `${d.amount}%` : formatMoney(d.amount, symbol)}
                  <span className="ml-1 text-xs text-slate-400 capitalize">({d.frequency})</span>
                </td>
                <td className="py-2 text-right"><Badge tone={d.status === 'active' ? 'green' : 'gray'}>{d.status}</Badge></td>
                <td className="py-2 text-right">
                  <button type="button" className="btn-ghost p-1 text-xs text-amber-600" onClick={() => run(() => toggleDeductionStatusAction(d.id, employeeId, d.status === 'active' ? 'inactive' : 'active'))}>{d.status === 'active' ? 'Disable' : 'Enable'}</button>
                  <button type="button" className="btn-ghost p-1 text-xs text-red-600" onClick={() => run(() => deleteDeductionAction(d.id, employeeId))}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}