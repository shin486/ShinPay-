import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettingsAsync } from '@/lib/settings';
import { formatMoney, formatDate } from '@/lib/format';
import { getBusinessOptions, getReportEmployees, getReportsData } from '@/lib/queries';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { ReportFilters } from '@/components/ReportFilters';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { business?: string; from?: string; to?: string; employee?: string };
}) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const settings = await getSettingsAsync();
  const sym = settings.currency_symbol || '\u20B1';
  const businessFilter = searchParams.business || '';
  const from = searchParams.from || '';
  const to = searchParams.to || '';
  const employeeFilter = searchParams.employee || '';

  const businesses = await getBusinessOptions(orgId);
  const employees = await getReportEmployees(orgId);

  const { summaryRows, byBusiness, empReport, dedReport } = await getReportsData(orgId, {
    business: businessFilter,
    from,
    to,
    employee: employeeFilter,
  });

  const summaryGross = Number(summaryRows?.gross || 0);
  const summaryDed = Number(summaryRows?.deductions || 0);
  const summaryNet = Number(summaryRows?.net || 0);
  const summaryEmployees = Number(summaryRows?.employees || 0);
  const summaryPeriods = Number(summaryRows?.periods || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Statutory & Executive Reports"
        subtitle="Consolidated payroll summaries, business breakdowns, employee historical wages, and statutory deduction reports."
      />

      <ReportFilters businesses={businesses} employees={employees} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Payroll Summary (In Scope)">
          <div className="grid grid-cols-2 gap-4">
            <SummaryStat label="Payroll Periods" value={String(summaryPeriods)} />
            <SummaryStat label="Employees Processed" value={String(summaryEmployees)} />
            <SummaryStat label="Total Gross Compensation" value={formatMoney(summaryGross, sym)} />
            <SummaryStat label="Total Deductions (Statutory)" value={formatMoney(summaryDed, sym)} red />
            <SummaryStat label="Net Total Disbursed" value={formatMoney(summaryNet, sym)} strong />
          </div>
        </Card>

        <Card title="Disbursal Volume by Business">
          {byBusiness.length === 0 ? (
            <EmptyState title="No finalized payroll in this scope" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="th">Business</th>
                    <th className="th text-right">Runs</th>
                    <th className="th text-right">Net Total</th>
                  </tr>
                </thead>
                <tbody>
                  {byBusiness.map((b: any) => (
                    <tr key={String(b.name)} className="table-row">
                      <td className="td font-medium text-[var(--text-primary)]">{String(b.name)}</td>
                      <td className="td text-right text-xs text-[var(--text-muted)] font-mono">{String(b.periods)} cycle(s)</td>
                      <td className="td text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatMoney(b.net, sym)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-bold" style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}>
                    <td className="td text-[var(--text-primary)]">TOTAL</td>
                    <td className="td" />
                    <td className="td text-right font-mono text-emerald-600 dark:text-emerald-400 text-base">
                      {formatMoney(byBusiness.reduce((s: number, b: any) => s + Number(b.net), 0), sym)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Employee Historical Compensation">
          {!employeeFilter ? (
            <EmptyState title="Select an employee" message="Choose an employee above to inspect their compensation history." />
          ) : empReport.length === 0 ? (
            <EmptyState title="No payroll records" message="No finalized payroll found for this employee in scope." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="th">Period Dates</th>
                    <th className="th text-right">Gross</th>
                    <th className="th text-right">Deductions</th>
                    <th className="th text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody>
                  {empReport.map((r: any, idx: number) => (
                    <tr key={idx} className="table-row">
                      <td className="td text-[var(--text-primary)]">
                        {formatDate(String(r.payroll_period_start))} — {formatDate(String(r.payroll_period_end))}
                      </td>
                      <td className="td text-right font-mono text-[var(--text-secondary)]">{formatMoney(r.gross_pay, sym)}</td>
                      <td className="td text-right font-mono text-red-600 dark:text-red-400">-{formatMoney(r.total_deductions, sym)}</td>
                      <td className="td text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatMoney(r.net_pay, sym)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Statutory & Withholding Deductions Summary">
          {dedReport.length === 0 ? (
            <EmptyState title="No deductions in scope" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="th">Deduction Description</th>
                    <th className="th text-right">Impacted Employees</th>
                    <th className="th text-right">Total Withheld</th>
                  </tr>
                </thead>
                <tbody>
                  {dedReport.map((d: any) => (
                    <tr key={String(d.name)} className="table-row">
                      <td className="td font-medium text-[var(--text-primary)]">{String(d.name)}</td>
                      <td className="td text-right text-xs text-[var(--text-muted)] font-mono">{String(d.employees)}</td>
                      <td className="td text-right font-bold font-mono text-red-600 dark:text-red-400">{formatMoney(d.total, sym)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="no-print pt-2">
        <Link href="/app/history" className="btn-secondary">
          View Detailed Disbursal History Archive →
        </Link>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, red, strong }: { label: string; value: string; red?: boolean; strong?: boolean }) {
  return (
    <div
      className="rounded-xl p-3.5 border transition-all"
      style={{
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p
        className={`mt-1 text-lg font-bold font-mono ${
          red
            ? 'text-red-600 dark:text-red-400'
            : strong
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-[var(--text-primary)]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
