'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  deactivateBusinessAction,
  reactivateBusinessAction,
  deleteBusinessAction,
} from '@/lib/actions/business-actions';
import { Modal } from '@/components/Modal';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Ban,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

export function BusinessActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setOpen(false);
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.ok) {
        setConfirmDeleteOpen(false);
        router.refresh();
      } else {
        setError(res.error || 'Action failed.');
      }
    });
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={pending}
        aria-label="Open business actions menu"
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[var(--surface-raised)] dark:hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-44 origin-top-right rounded-xl bg-white dark:bg-[var(--surface)] py-1.5 shadow-lg ring-1 ring-gray-900/5 dark:ring-[var(--border)] focus:outline-none animate-fade-in"
        >
          <Link
            href={`/app/businesses/${id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--surface-raised)] transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            <span>View Details</span>
          </Link>

          <Link
            href={`/app/businesses/${id}/edit`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--surface-raised)] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-gray-400" />
            <span>Edit Business</span>
          </Link>

          {status === 'active' ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deactivateBusinessAction(id))}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-amber-600 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 transition-colors"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Deactivate</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => reactivateBusinessAction(id))}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reactivate</span>
            </button>
          )}

          <div className="my-1 border-t border-gray-100 dark:border-[var(--border)]" />

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              setError(null);
              setConfirmDeleteOpen(true);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50/60 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Business</span>
          </button>
        </div>
      )}

      {error && !confirmDeleteOpen && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}

      <Modal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete business?"
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
              This will permanently delete the business entity. This is only possible if no employees are assigned to it. Are you sure?
            </p>
            {error && (
              <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => run(() => deleteBusinessAction(id))}
                disabled={pending}
              >
                {pending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
