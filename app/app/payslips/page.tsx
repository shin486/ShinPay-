import Link from 'next/link';
import { redirect } from 'next/navigation';
import { all } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettings } from '@/lib/settings';
import { formatMoney, formatDate, formatDateTime } from '@/lib/format';
import { PageHeader, EmptyState } from '@/components/ui';
import { PayslipSelector } from '@/components/PayslipSelector';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PayslipsPage({ searchParams }: { searchParams: { payroll?: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const sym = getSettings().currency_symbol || '₱';
  const payrollId = searchParams.payroll ? Number(searchParams.payroll) : 0;

  const payrolls = all(
    `SELECT p.*, b.name AS business_name FROM payroll p
     JOIN businesses b ON b.id = p.business_id
     WHERE p.status = 'finalized' AND p.organization_id = ?
     ORDER BY p.payroll_period_end DESC`,
    orgId
  );

  const selectorOptions = payrolls.map((p) => ({
    id: Number(p.id),
    label: `${String(p.business_name)} — Cut-off ${formatDate(String(p.payroll_period_start))} to ${formatDate(String(p.payroll_period_end))} (${formatDate(String(p.pay_date))})`,
  }));

  let items: Record<string, unknown>[] = [];
  let selectedPayroll: Record<string, unknown> | undefined;

  if (payrollId) {
    selectedPayroll = payrolls.find((x) => Number(x.id) === payrollId);
    if (selectedPayroll) {
      items = all(
        `SELECT pi.*, e.employee_id AS emp_code, e.first_name, e.last_name, e.position
         FROM payroll_items pi
         JOIN employees e ON e.id = pi.employee_id
         WHERE pi.payroll_id = ?
         ORDER BY e.last_name`,
        payrollId
      );
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Employee Payslips"
        subtitle="Generate and review official Philippine BIR & DOLE compliant employee compensation slips."
      />

      <div
        className="rounded-2xl p-4 sm:p-5 border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <PayslipSelector payrolls={selectorOptions} selectedId={payrollId} />
      </div>

      <div className="card flex flex-col overflow-hidden">
        {!payrollId ? (
          <div className="p-10">
            <EmptyState
              title="No payroll run selected"
              message="Choose a finalized payroll cut-off above to view individual employee payslips."
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="No payslips found"
              message="This payroll run does not contain any computed employee pay records."
            />
          </div>
        ) : (
          <div>
            <div
              className="flex items-center justify-between gap-3 px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Available Payslips ({items.length})
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {String(selectedPayroll?.business_name)} • Period {formatDate(String(selectedPayroll?.payroll_period_start))} to {formatDate(String(selectedPayroll?.payroll_period_end))}
                </p>
              </div>
              <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Finalized Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <th className="th">Employee</th>
                    <th className="th">ID / Code</th>
                    <th className="th text-right">Gross Pay</th>
                    <th className="th text-right">Total Deductions</th>
                    <th className="th text-right">Net Take-Home</th>
                    <th className="th text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => {
                    const initials = `${String(i.first_name).charAt(0)}${String(i.last_name).charAt(0)}`.toUpperCase();
                    return (
                      <tr key={String(i.id)} className="table-row">
                        <td className="td">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0 shadow-sm"
                              style={{ background: 'var(--accent)' }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">
                                {String(i.first_name)} {String(i.last_name)}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {String(i.position || 'Staff')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="td font-mono text-xs text-[var(--text-secondary)]">
                          {String(i.emp_code)}
                        </td>
                        <td className="td text-right font-mono text-[var(--text-secondary)]">
                          {formatMoney(i.gross_pay, sym)}
                        </td>
                        <td className="td text-right font-mono text-red-600 dark:text-red-400">
                          -{formatMoney(i.total_deductions, sym)}
                        </td>
                        <td className="td text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatMoney(i.net_pay, sym)}
                        </td>
                        <td className="td text-right">
                          <Link
                            href={`/app/payslips/${i.id}?payroll=${payrollId}`}
                            className="btn-ghost p-1.5 text-xs font-semibold hover:text-[var(--accent)]"
                          >
                            <FileText className="h-3.5 w-3.5 inline mr-1" />
                            View Payslip →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}