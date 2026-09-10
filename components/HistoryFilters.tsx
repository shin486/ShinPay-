'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function HistoryFilters({ businesses }: { businesses: { id: number; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [businessId, setBusinessId] = useState(params.get('business') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');

  function apply() {
    const p = new URLSearchParams();
    if (businessId) p.set('business', businessId);
    if (status) p.set('status', status);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    router.push(`/app/history?${p.toString()}`);
  }

  function reset() {
    setBusinessId('');
    setStatus('');
    setFrom('');
    setTo('');
    router.push('/app/history');
  }

  const hasFilter = Boolean(businessId || status || from || to);

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
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-40">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          Workflow Status
        </label>
        <select
          className="input w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="calculated">Calculated</option>
          <option value="for_review">For Review</option>
          <option value="finalized">Finalized</option>
          <option value="cancelled">Cancelled</option>
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