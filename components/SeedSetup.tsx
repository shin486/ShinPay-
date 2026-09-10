'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { seedSampleDataAction } from '@/lib/actions/seed-actions';
import { FormError } from '@/components/ui';

export function SeedSetup() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    setError(null); setMsg(null);
    startTransition(async () => {
      const res = await seedSampleDataAction();
      if (res.ok) { setMsg('Sample businesses and employees loaded. Existing records were preserved.'); router.refresh(); }
      else setError(res.error || 'Could not load sample data.');
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--text-muted)]">
        Load the current client setup: 5 businesses and 17 employees. This is fully optional and can be
        edited afterwards. Records that already exist are skipped to avoid duplicates.
      </p>
      <div className="flex items-center gap-3">
        <button type="button" className="btn-secondary" onClick={load} disabled={pending}>
          {pending ? 'Loading…' : 'Load 5 businesses + 17 employees'}
        </button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </div>
      <FormError error={error} />
    </div>
  );
}