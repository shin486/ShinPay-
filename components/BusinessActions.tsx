'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  deactivateBusinessAction,
  reactivateBusinessAction,
  deleteBusinessAction,
} from '@/lib/actions/business-actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Eye, Pencil, Trash2, Ban, RotateCcw } from 'lucide-react';

export function BusinessActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.ok) router.refresh();
      else setError(res.error || 'Action failed.');
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Link href={`/app/businesses/${id}`} className="btn-ghost p-1.5" title="View" aria-label="View"><Eye className="h-4 w-4" /></Link>
        <Link href={`/app/businesses/${id}/edit`} className="btn-ghost p-1.5" title="Edit" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
        {status === 'active' ? (
          <button
            type="button"
            className="btn-ghost p-1.5 text-amber-600"
            title="Deactivate"
            disabled={pending}
            onClick={() => run(() => deactivateBusinessAction(id))}
          >
            <Ban className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            className="btn-ghost p-1.5 text-emerald-600"
            title="Reactivate"
            disabled={pending}
            onClick={() => run(() => reactivateBusinessAction(id))}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        <ConfirmDialog
          title="Delete business?"
          message="This will permanently delete the business. Only possible if it has no employees. Are you sure?"
          confirmLabel="Delete"
          danger
          onConfirm={() => run(() => deleteBusinessAction(id))}
          trigger={<button type="button" className="btn-ghost p-1.5 text-red-600" title="Delete" aria-label="Delete" disabled={pending}><Trash2 className="h-4 w-4" /></button>}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
  );
}