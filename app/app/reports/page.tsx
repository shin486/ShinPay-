import { redirect } from 'next/navigation';
import Link from 'next/link';
import { all, idNameOptions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettings } from '@/lib/settings';
import { formatMoney, formatDate } from '@/lib/format';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { ReportFilters } from '@/components/ReportFilters';
import type { IdNameOption } from '@/lib/db';

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
  const sym = getSettings().currency_symbol || '\u20B1';
  const businessFilter = searchParams.business || '';
  const from = searchParams.from || '';
  const to = searchParams.to || '';
  const employeeFilter = searchParams.employee || '';

  const businesses: IdNameOption[] = idNameOptions("SELECT id, name FROM businesses WHERE organization_id = ? ORDER BY name", orgId);
  const employees: IdNameOption[] = idNameOptions(
    "SELECT e.id, (e.last_name || ', ' || e.first_name) AS name FROM employees e WHERE e.organization_id = ? AND e.status = 'active' ORDER BY name", orgId
  );

  // Payroll summary across finalized payrolls in scope
  const sumClauses: string[] = ["p.status = 'finalized'", "p.organization_id = ?"];
  const sumParams: unknown[] = [orgId];
  if (businessFilter) { sumClauses.push('p.business_id = ?'); sumParams.push(Number(businessFilter)); }
  if (from) { sumClauses.push('p.payroll_period_end >= ?'); sumParams.push(from); }
  if (to) { sumClauses.push('p.payroll_period_start <= ?'); sumParams.push(to); }
  const summaryRows = all(
    `SELECT COUNT(DISTINCT p.id) AS periods, COALESCE(SUM(p.employee_count), 0) AS employees,
            COALESCE(SUM(p.total_gross), 0) AS gross, COALESCE(SUM(p.total_deductions), 0) AS deductions,
            COALESCE(SUM(p.total_net), 0) AS net
     FROM payroll p WHERE ${sumClauses.join(' AND ')}`,
    ...sumParams
  )[0];

  // Payroll by business (finalized, in scope)
  const byBusinessFilterParams: unknown[] = [];
  const byBusiness = all(
    `SELECT b.name, COALESCE(SUM(p.total_net), 0) AS net, COUNT(p.id) AS periods
     FROM businesses b
     LEFT JOIN payroll p ON p.business_id = b.id AND p.status = 'finalized'
     ${businessFilter ? 'AND p.business_id = ?' : ''}
     ${from ? 'AND p.payroll_period_end >= ?' : ''}
     ${to ? 'AND p.payroll_period_start <= ?' : ''}
     WHERE b.organization_id = ?
     GROUP BY b.id, b.name ORDER BY b.name`,
    ...(businessFilter ? [Number(businessFilter)] : []),
    ...(from ? [from] : []),
    ...(to ? [to] : []),
    orgId
  );

  // Employee payroll history
  const empClauses: string[] = ["pi.payroll_id = p.id", "p.status = 'finalized'", "p.organization_id = ?"];
  const empParams: unknown[] = [orgId];
  if (employeeFilter) { empClauses.push('pi.employee_id = ?'); empParams.push(Number(employeeFilter)); }
  if (businessFilter) { empClauses.push('p.business_id = ?'); empParams.push(Number(businessFilter)); }
  if (from) { empClauses.push('p.payroll_period_end >= ?'); empParams.push(from); }
  if (to) { empClauses.push('p.payroll_period_start <= ?'); empParams.push(to); }
  const empReport = all(
    `SELECT e.first_name, e.last_name, e.employee_id, p.payroll_period_start, p.payroll_period_end,
            pi.gross_pay, pi.total_deductions, pi.net_pay
     FROM payroll_items pi
     JOIN employees e ON e.id = pi.employee_id
     JOIN payroll p ON ${empClauses.join(' AND ')}
     ORDER BY e.last_name, p.payroll_period_end DESC`,
    ...empParams
  );

  // Deduction report
  const dedClauses: string[] = ["p.organization_id = ?"];
  const dedParams: unknown[] = [orgId];
  if (businessFilter) { dedClauses.push('p.business_id = ?'); dedParams.push(Number(businessFilter)); }
  if (from) { dedClauses.push('p.payroll_period_end >= ?'); dedParams.push(from); }
  if (to) { dedClauses.push('p.payroll_period_start <= ?'); dedParams.push(to); }
  const dedWhere = dedClauses.length ? `AND ${dedClauses.join(' AND ')}` : '';
  const dedReport = all(
    `SELECT pid.name, SUM(pid.amount) AS total, COUNT(DISTINCT pi.employee_id) AS employees
     FROM payroll_item_deductions pid
     JOIN payroll_items pi ON pi.id = pid.payroll_item_id
     JOIN payroll p ON p.id = pi.payroll_id AND p.status = 'finalized'
     WHERE ${dedClauses.join(' AND ')}
     GROUP BY pid.name ORDER BY pid.name`,
    ...dedParams
  );

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
                  {byBusiness.map((b) => (
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
                      {formatMoney(byBusiness.reduce((s, b) => s + Number(b.net), 0), sym)}
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
                  {empReport.map((r, idx) => (
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
                  {dedReport.map((d) => (
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