import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettingsAsync } from '@/lib/settings';
import { formatMoney, formatDate } from '@/lib/format';
import { getPayrolls } from '@/lib/queries';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { Plus, Calendar, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const settings = await getSettingsAsync();
  const sym = settings.currency_symbol || '₱';

  const payrolls = await getPayrolls(orgId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payroll Runs"
        subtitle="Manage semi-monthly payroll cycles, Maker-Checker sign-offs, and bank disbursals."
        actions={
          <Link href="/app/payroll/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span>Create New Payroll</span>
          </Link>
        }
      />

      <div className="card flex flex-col overflow-hidden">
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              All Payroll Cycles ({payrolls.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Historical and active cut-off periods across all business entities
            </p>
          </div>
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            DOLE Standard Cycles
          </span>
        </div>

        {payrolls.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No payroll periods found"
              message="Create your first payroll run to calculate basic salaries, DOLE overtime, and statutory contributions."
              action={
                <Link href="/app/payroll/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                  <Plus className="h-3.5 w-3.5" />
                  Create First Payroll
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="th">Cut-Off Period</th>
                  <th className="th">Business Entity</th>
                  <th className="th text-right">Headcount</th>
                  <th className="th text-right">Total Gross</th>
                  <th className="th text-right">Deductions</th>
                  <th className="th text-right">Net Take-Home</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={String(p.id)} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[var(--accent)] shrink-0" />
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {formatDate(String(p.payroll_period_start))} — {formatDate(String(p.payroll_period_end))}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">
                            Pay date: {formatDate(String(p.pay_date))}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="td font-medium text-[var(--text-secondary)]">
                      {String(p.business_name)}
                    </td>
                    <td className="td text-right">
                      <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {String(p.employee_count)}
                      </span>
                    </td>
                    <td className="td text-right font-mono text-[var(--text-secondary)]">
                      {formatMoney(p.total_gross, sym)}
                    </td>
                    <td className="td text-right font-mono text-red-600 dark:text-red-400">
                      -{formatMoney(p.total_deductions, sym)}
                    </td>
                    <td className="td text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatMoney(p.total_net, sym)}
                    </td>
                    <td className="td">
                      <StatusBadge status={String(p.status)} />
                    </td>
                    <td className="td text-right">
                      <Link
                        href={`/app/payroll/${p.id}`}
                        className="btn-ghost p-1.5 text-xs font-semibold hover:text-[var(--accent)]"
                      >
                        Open Console →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
