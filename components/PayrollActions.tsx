'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  calculatePayrollAction,
  setPayrollStatusAction,
  finalizePayrollAction,
  cancelPayrollAction,
  reversePayrollAction,
  deletePayrollAction,
  exportBankAdviceCsvAction,
} from '@/lib/actions/payroll-actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CsvDownload } from '@/components/CsvDownload';
import {
  Calculator,
  FileCheck,
  RotateCcw,
  XCircle,
  Trash2,
  Download,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export function PayrollActions({ payrollId, status }: { payrollId: number; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const finalized = status === 'finalized';

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, refresh = true) {
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.ok) {
        if (refresh) router.refresh();
        else router.push('/app/payroll');
      } else setError(res.error || 'Action failed.');
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ── PESONet Batch CSV Advice (Available for finalized runs) ── */}
      {finalized && (
        <CsvDownload
          action={() => exportBankAdviceCsvAction(payrollId)}
          label="Export PESONet / BPI Advice"
          className="btn-primary"
          icon={<Download className="h-4 w-4" />}
        />
      )}

      {/* Print summary button */}
      <button
        type="button"
        onClick={() => window.print()}
        className="btn-secondary"
        title="Print Payroll Summary"
      >
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Print Summary</span>
      </button>

      {/* ── Active Workflow Buttons ── */}
      {!finalized && status !== 'cancelled' && (
        <>
          <button
            type="button"
            className="btn-secondary"
            disabled={pending}
            onClick={() => run(() => calculatePayrollAction(payrollId))}
          >
            <Calculator className="h-4 w-4 text-[var(--accent)]" />
            <span>{status === 'calculated' || status === 'for_review' ? 'Recalculate Run' : 'Calculate Run'}</span>
          </button>

          {status === 'calculated' && (
            <button
              type="button"
              className="btn-secondary"
              disabled={pending}
              onClick={() => run(() => setPayrollStatusAction(payrollId, 'for_review'))}
            >
              Submit for Review
            </button>
          )}

          <ConfirmDialog
            title="Finalize and Sign Off Payroll?"
            message={
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>
                  Are you ready to execute the <strong>Maker-Checker final sign-off</strong> for this payroll period?
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Once finalized, statutory contributions and take-home pay records are locked for audit compliance and bank clearing advice generation.
                </p>
              </div>
            }
            confirmLabel="Finalize & Sign Off"
            onConfirm={() => run(() => finalizePayrollAction(payrollId), true)}
            trigger={
              <button type="button" className="btn-primary" disabled={pending}>
                <FileCheck className="h-4 w-4" />
                <span>Finalize & Sign Off</span>
              </button>
            }
          />

          <ConfirmDialog
            title="Cancel payroll run?"
            message="This will mark the payroll run as cancelled. The records remain in the system for historical audit trails."
            confirmLabel="Cancel Run"
            danger
            onConfirm={() => run(() => cancelPayrollAction(payrollId))}
            trigger={
              <button type="button" className="btn-ghost text-amber-600 dark:text-amber-400" disabled={pending}>
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            }
          />
        </>
      )}

      {/* ── Reversal for Finalized Runs ── */}
      {finalized && (
        <ConfirmDialog
          title="Reverse finalized payroll?"
          message="This marks the finalized payroll as reversed (cancelled) for correction. The original record is preserved for statutory audit. Are you sure you wish to proceed?"
          confirmLabel="Reverse Payroll"
          danger
          onConfirm={() => run(() => reversePayrollAction(payrollId))}
          trigger={
            <button type="button" className="btn-ghost text-red-600 dark:text-red-400 text-xs" disabled={pending}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reverse Finalization</span>
            </button>
          }
        />
      )}

      {/* ── Delete Draft ── */}
      {status === 'draft' && (
        <ConfirmDialog
          title="Delete draft payroll?"
          message="Only draft payrolls that have never been calculated can be deleted. This cannot be undone."
          confirmLabel="Delete Draft"
          danger
          onConfirm={() => run(() => deletePayrollAction(payrollId), false)}
          trigger={
            <button type="button" className="btn-ghost text-red-600 dark:text-red-400" disabled={pending}>
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          }
        />
      )}

      {error && <p className="w-full text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}