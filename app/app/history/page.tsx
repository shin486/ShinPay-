import Link from 'next/link';
import { redirect } from 'next/navigation';
import { all, idNameOptions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettings } from '@/lib/settings';
import { formatMoney, formatDate, formatDateTime } from '@/lib/format';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { HistoryFilters } from '@/components/HistoryFilters';
import { CsvDownload } from '@/components/CsvDownload';
import { exportPayrollsCsvAction } from '@/lib/actions/report-actions';
import type { IdNameOption } from '@/lib/db';
import { FileText, Download, Calendar, Building2, Users, Banknote, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { business?: string; status?: string; from?: string; to?: string };
}) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const sym = getSettings().currency_symbol || '\u20B1';
  const businessFilter = searchParams.business || '';
  const statusFilter = searchParams.status || '';
  const from = searchParams.from || '';
  const to = searchParams.to || '';

  const businesses: IdNameOption[] = idNameOptions(
    'SELECT id, name FROM businesses WHERE organization_id = ? ORDER BY name',
    orgId
  );

  const payrolls = all(
    `SELECT p.*, b.name AS business_name FROM payroll p JOIN businesses b ON b.id = p.business_id
     WHERE p.organization_id = ? ORDER BY p.payroll_period_end DESC`,
    orgId
  ).filter((r) => {
    const matchBusiness = !businessFilter || String(r.business_id) === businessFilter;
    const matchStatus = !statusFilter || String(r.status) === statusFilter;
    const matchFrom = !from || String(r.payroll_period_end) >= from;
    const matchTo = !to || String(r.payroll_period_start) <= to;
    return matchBusiness && matchStatus && matchFrom && matchTo;
  });

  const totalFilteredGross = payrolls.reduce((acc, p) => acc + (Number(p.total_gross) || 0), 0);
  const totalFilteredNet = payrolls.reduce((acc, p) => acc + (Number(p.total_net) || 0), 0);
  const totalEmployeesServed = payrolls.reduce((acc, p) => acc + (Number(p.employee_count) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll History"
        subtitle="Archived and audited payroll cut-off records across Philippine legal entities"
        actions={
          <CsvDownload
            action={exportPayrollsCsvAction}
            label="Export Audit CSV"
            icon={<Download className="h-4 w-4" />}
          />
        }
      />

      {/* Summary KPI chips */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sage-100 text-sage-800 dark:bg-sage-900/40 dark:text-sage-300">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium">Filtered Runs</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{payrolls.length} <span className="text-xs font-normal text-[var(--text-muted)]">periods</span></p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium">Total Net Disbursed</p>
            <p className="text-xl font-bold font-mono text-[var(--text-primary)]">{formatMoney(totalFilteredNet, sym)}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium">Headcount Processed</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{totalEmployeesServed.toLocaleString()} <span className="text-xs font-normal text-[var(--text-muted)]">payslips</span></p>
          </div>
        </div>
      </div>

      <HistoryFilters businesses={businesses} />

      <div className="card overflow-hidden">
        {payrolls.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No payroll records found"
              message="Adjust your filters or process a payroll first."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="th">Cut-Off Period</th>
                  <th className="th">Business Entity</th>
                  <th className="th text-right">Employees</th>
                  <th className="th text-right">Gross Pay</th>
                  <th className="th text-right">Deductions</th>
                  <th className="th text-right">Net Take-Home</th>
                  <th className="th">Status</th>
                  <th className="th">Processed On</th>
                  <th className="th text-right">Actions</th>
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
                    <td className="td">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                        <Building2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        {String(p.business_name)}
                      </span>
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
                    <td className="td text-xs text-[var(--text-muted)]">
                      {formatDateTime(String(p.finalized_at || p.created_at))}
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/app/payroll/${p.id}`}
                          className="btn-ghost p-1.5 text-xs font-semibold hover:text-[var(--accent)]"
                          title="View Payroll Details"
                        >
                          View <ArrowUpRight className="h-3 w-3 inline ml-0.5" />
                        </Link>
                        <Link
                          href={`/app/payslips?payroll=${p.id}`}
                          className="btn-secondary py-1 px-2 text-xs font-semibold"
                          title="Generate BIR/DOLE Payslips"
                        >
                          <FileText className="h-3.5 w-3.5 inline mr-1 text-[var(--accent)]" />
                          Payslips
                        </Link>
                      </div>
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