'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/format';
import { FormError, Badge } from '@/components/ui';
import {
  addEarningAction,
  deleteEarningAction,
  toggleEarningStatusAction,
} from '@/lib/actions/employee-actions';

export type EarningRow = {
  id: number;
  name: string;
  amount: number;
  calculation_type: string;
  frequency: string;
  one_time: number;
  status: string;
};

const FREQS = ['monthly', 'semi-monthly', 'bi-weekly', 'weekly'];

export function EarningsManager({
  employeeId,
  types,
  earnings,
  symbol,
}: {
  employeeId: number;
  types: { id: number; name: string }[];
  earnings: EarningRow[];
  symbol: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [calc, setCalc] = useState('fixed');
  const [freq, setFreq] = useState('monthly');
  const [oneTime, setOneTime] = useState(false);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.ok) {
        setType(''); setAmount(''); setCalc('fixed'); setFreq('monthly'); setOneTime(false);
        router.refresh();
      } else setError(res.error || 'Action failed.');
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() =>
      addEarningAction(employeeId, {
        earning_type_id: type,
        amount,
        calculation_type: calc,
        frequency: freq,
        one_time: oneTime,
      })
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="grid grid-cols-2 gap-2 sm:grid-cols-6 items-end">
        <div className="col-span-2">
          <label className="label">Earning Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select…</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div><label className="label">Amount / %</label><input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" /></div>
        <div><label className="label">Type</label><select className="input" value={calc} onChange={(e) => setCalc(e.target.value)}><option value="fixed">Fixed</option><option value="percentage">% of Basic</option></select></div>
        <div><label className="label">Frequency</label><select className="input" value={freq} onChange={(e) => setFreq(e.target.value)}>{FREQS.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}</select></div>
        <div><label className="label">&nbsp;</label><button type="submit" className="btn-primary w-full" disabled={pending}>Add</button></div>
      </form>
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" checked={oneTime} onChange={(e) => setOneTime(e.target.checked)} /> One-time earning
      </label>
      <FormError error={error} />
      {earnings.length === 0 ? (
        <p className="text-xs text-slate-400">No earnings configured.</p>
      ) : (
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <tbody className="divide-y divide-slate-100">
            {earnings.map((e) => (
              <tr key={e.id}>
                <td className="py-2 font-medium text-slate-700">{e.name}{e.one_time ? ' (one-time)' : ''}</td>
                <td className="py-2 text-right text-slate-600">
                  {e.calculation_type === 'percentage' ? `${e.amount}%` : formatMoney(e.amount, symbol)}
                  <span className="ml-1 text-xs text-slate-400 capitalize">({e.frequency})</span>
                </td>
                <td className="py-2 text-right"><Badge tone={e.status === 'active' ? 'green' : 'gray'}>{e.status}</Badge></td>
                <td className="py-2 text-right">
                  <button type="button" className="btn-ghost p-1 text-xs text-amber-600" onClick={() => run(() => toggleEarningStatusAction(e.id, employeeId, e.status === 'active' ? 'inactive' : 'active'))}>{e.status === 'active' ? 'Disable' : 'Enable'}</button>
                  <button type="button" className="btn-ghost p-1 text-xs text-red-600" onClick={() => run(() => deleteEarningAction(e.id, employeeId))}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}