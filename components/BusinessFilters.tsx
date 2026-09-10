'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export function BusinessFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [status, setStatus] = useState(params.get('status') || '');

  function apply() {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (status) p.set('status', status);
    router.push(`/app/businesses?${p.toString()}`);
  }

  function reset() {
    setQ('');
    setStatus('');
    router.push('/app/businesses');
  }

  const hasFilter = Boolean(q || status);

  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded-2xl p-4 border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="relative min-w-[240px] flex-1 sm:flex-initial">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          Search Entities
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="Search business name or code…"
            className="input pl-9 w-full"
          />
        </div>
      </div>

      <div className="w-full sm:w-44">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
          Entity Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input w-full"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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