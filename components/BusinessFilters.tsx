'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

export function BusinessFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [status, setStatus] = useState(params.get('status') || '');

  function apply(nextQ = q, nextStatus = status) {
    const p = new URLSearchParams();
    if (nextQ.trim()) p.set('q', nextQ.trim());
    if (nextStatus) p.set('status', nextStatus);
    const qs = p.toString();
    router.push(qs ? `/app/businesses?${qs}` : '/app/businesses');
  }

  function handleStatusChange(val: string) {
    setStatus(val);
    apply(q, val);
  }

  function reset() {
    setQ('');
    setStatus('');
    router.push('/app/businesses');
  }

  const hasFilter = Boolean(q || status);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply(q, status)}
          onBlur={() => {
            if (q !== (params.get('q') || '')) apply(q, status);
          }}
          placeholder="Search business name or code…"
          aria-label="Search businesses"
          className="w-full rounded-lg bg-white dark:bg-[var(--surface)] pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-[var(--text-primary)] placeholder:text-gray-400 shadow-2xs ring-1 ring-inset ring-gray-200/80 dark:ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        />
      </div>

      <div className="w-full sm:w-40">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="w-full rounded-lg bg-white dark:bg-[var(--surface)] px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] shadow-2xs ring-1 ring-inset ring-gray-200/80 dark:ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)] transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
