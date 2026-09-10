'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function ReportFilters({
  businesses,
  employees,
}: {
  businesses: { id: number; name: string }[];
  employees: { id: number; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [business, setBusiness] = useState(params.get('business') || '');
  const [employee, setEmployee] = useState(params.get('employee') || '');
  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');

  function apply() {
    const p = new URLSearchParams();
    if (business) p.set('business', business);
    if (employee) p.set('employee', employee);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    router.push(`/app/reports?${p.toString()}`);
  }

  function reset() {
    setBusiness('');
    setEmployee('');
    setFrom('');
    setTo('');
    router.push('/app/reports');
  }

  const hasFilter = Boolean(business || employee || from || to);

  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded-2xl p-4 border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="w-full sm:w-52">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          Business Entity
        </label>
        <select
          className="input w-full"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-52">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          Individual Employee
        </label>
        <select
          className="input w-full"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
        >
          <option value="">All employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-40">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          From Date
        </label>
        <input
          type="date"
          className="input w-full"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      <div className="w-full sm:w-40">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          To Date
        </label>
        <input
          type="date"
          className="input w-full"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button type="button" className="btn-primary" onClick={apply}>
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>

        {hasFilter && (
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={reset}
            title="Reset filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}