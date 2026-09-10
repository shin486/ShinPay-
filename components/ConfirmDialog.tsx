'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

/**
 * A confirmation dialog that runs an async action.
 * Used for destructive/important actions such as finalizing payroll.
 */
export function ConfirmDialog({
  trigger,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-slate-600">{message}</div>
            {error && (
              <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className={danger ? 'btn-danger' : 'btn-primary'}
                onClick={handleConfirm}
                disabled={busy}
              >
                {busy ? 'Processing…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}