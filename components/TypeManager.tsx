'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addEarningTypeAction, addDeductionTypeAction } from '@/lib/actions/employee-actions';
import { FormError, Badge } from '@/components/ui';

export type TypeRow = { id: number; name: string; description?: string; calculation_type?: string; status?: string };

export function TypeManager({ kind, types }: { kind: 'earning' | 'deduction'; types: TypeRow[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calc, setCalc] = useState('fixed');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = kind === 'earning'
        ? await addEarningTypeAction({ name, description, calculation_type: calc })
        : await addDeductionTypeAction({ name, description, calculation_type: calc });
      if (res.ok) { setName(''); setDescription(''); setCalc('fixed'); router.refresh(); }
      else setError(res.error || 'Could not add type.');
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
        <div><label className="label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label className="label">Calculation</label>
          <select className="input" value={calc} onChange={(e) => setCalc(e.target.value)}>
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        <div className="sm:col-span-2"><label className="label">Description</label><input className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      </form>
      <div className="flex items-center gap-2">
        <button type="submit" className="btn-secondary" onClick={submit} disabled={pending}>Add {kind === 'earning' ? 'Earning' : 'Deduction'} Type</button>
        <FormError error={error} />
      </div>
      <ul className="space-y-2">
        {types.map((t) => (
          <li key={String(t.id)} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3.5 py-2.5 transition-colors">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{String(t.name)}</p>
              <p className="text-xs text-[var(--text-muted)]">{String(t.description || 'Standard rate')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                {String(t.calculation_type || 'fixed')}
              </span>
              <Badge tone={t.status === 'active' ? 'green' : 'gray'}>{String(t.status || 'active')}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}