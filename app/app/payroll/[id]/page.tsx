import Link from 'next/link';
import { redirect } from 'next/navigation';
import { all, get } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettings } from '@/lib/settings';
import { formatMoney, formatDate, formatDateTime } from '@/lib/format';
import { PageHeader, Card, StatusBadge, EmptyState } from '@/components/ui';
import { PayrollActions } from '@/components/PayrollActions';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Wallet,
  Banknote,
  FileText,
  Landmark,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PayrollDetailPage({ params }: { params: { id: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const id = Number(params.id);

  const p = get(
    'SELECT * FROM payroll WHERE id = ? AND organization_id = ?',
    id,
    orgId
  ) as Record<string, unknown> | undefined;

  if (!p) return <EmptyState title="Payroll not found" message="This payroll record does not exist or has been removed." />;

  const business = get(
    'SELECT name FROM businesses WHERE id = ? AND organization_id = ?',
    Number(p.business_id),
    orgId
  ) as { name: string } | undefined;

  const settings = getSettings();
  const sym = settings.currency_symbol || '₱';

  const items = all(
    `SELECT pi.*, e.employee_id AS emp_code, e.first_name, e.last_name, e.position
     FROM payroll_items pi
     JOIN employees e ON e.id = pi.employee_id
     WHERE pi.payroll_id = ?
     ORDER BY e.last_name`,
    id
  );

  // Statutory deduction breakdown
  const deductionBreakdown = all(
    `SELECT pid.name, SUM(pid.amount) AS total
     FROM payroll_item_deductions pid
     JOIN payroll_items pi ON pi.id = pid.payroll_item_id
     WHERE pi.payroll_id = ?
     GROUP BY pid.name
     ORDER BY total DESC`,
    id
  ) as Array<{ name: string; total: number }>;

  // Audit record for finalization
  const finalizationAudit = get(
    `SELECT al.*, u.display_name AS actor_name
     FROM audit_log al
     LEFT JOIN users u ON u.id = al.user_id
     WHERE al.entity = 'payroll' AND al.entity_id = ? AND al.action = 'PAYROLL_FINALIZED'
     ORDER BY al.id DESC LIMIT 1`,
    id
  ) as Record<string, unknown> | undefined;

  const totalGross = items.reduce((s, r) => s + Number(r.gross_pay), 0);
  const totalDeductions = items.reduce((s, r) => s + Number(r.total_deductions), 0);
  const totalNet = items.reduce((s, r) => s + Number(r.net_pay), 0);
  const totalOvertime = items.reduce((s, r) => s + Number(r.overtime || 0), 0);

  const status = String(p.status);
  const isFinalized = status === 'finalized';
  const hasItems = items.length > 0;
  const batchRef = `BATCH-PH-${id}-${String(p.payroll_period_end || '').replace(/-/g, '')}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Page Header ── */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
        <Link href="/app/payroll" className="hover:text-[var(--accent)] transition-colors">
          Payroll Runs
        </Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)] font-medium">Run #{id} ({String(business?.name)})</span>
      </div>

      <PageHeader
        title={`${String(business?.name ?? 'Business')} Payroll Run`}
        subtitle={`Period: ${formatDate(String(p.payroll_period_start))} to ${formatDate(String(p.payroll_period_end))} • Value Date: ${formatDate(String(p.pay_date))}`}
        actions={<PayrollActions payrollId={id} status={status} />}
      />

      {/* ── Maker-Checker Workflow Progression Steps ── */}
      <div
        className="rounded-2xl p-4 sm:p-5 border transition-all"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1: Draft */}
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">1. Cut-Off Created</p>
              <p className="text-[11px] text-[var(--text-muted)]">{formatDate(String(p.created_at))}</p>
            </div>
          </div>

          {/* Step 2: Calculated */}
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: hasItems ? 'var(--surface-raised)' : 'transparent', borderColor: 'var(--border)' }}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${hasItems ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">2. DOLE Computation</p>
              <p className="text-[11px] text-[var(--text-muted)]">{hasItems ? 'Statutory Triad Applied' : 'Pending Calculation'}</p>
            </div>
          </div>

          {/* Step 3: For Review */}
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: status === 'for_review' || isFinalized ? 'var(--surface-raised)' : 'transparent', borderColor: 'var(--border)' }}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${status === 'for_review' || isFinalized ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">3. Comptroller Audit</p>
              <p className="text-[11px] text-[var(--text-muted)]">{status === 'for_review' ? 'Under Review' : isFinalized ? 'Verified' : 'Pending Review'}</p>
            </div>
          </div>

          {/* Step 4: Finalized */}
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: isFinalized ? 'var(--accent-subtle)' : 'transparent', borderColor: isFinalized ? 'var(--accent)' : 'var(--border)' }}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${isFinalized ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">4. Disbursal Certified</p>
              <p className="text-[11px] text-[var(--text-muted)]">{isFinalized ? 'Maker-Checker Stamped' : 'Awaiting Sign-off'}</p>
            </div>
          </div>
        </div>

        {/* Physical Maker-Checker Sign-off Stamp (Visible when finalized) */}
        {isFinalized && (
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl p-4 border border-emerald-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(83, 108, 81, 0.08) 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    ✓ Maker-Checker Disbursal Certified
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                    {batchRef}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Sign-off executed by{' '}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {String(finalizationAudit?.actor_name || user.display_name || 'Executive Comptroller')}
                  </span>{' '}
                  • Corporate bank advice available for instant clearing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                PESONet / BPI Direct Batch Ready
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── KPI Financial Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Run Status</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-xl font-bold capitalize text-[var(--text-primary)]">{status.replace('_', ' ')}</p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Staff</span>
            <Users className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <p className="text-2xl font-bold font-sans text-[var(--text-primary)]">
            {String(p.employee_count || items.length)}
          </p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Pay</span>
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
            {formatMoney(totalGross, sym)}
          </p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Deductions</span>
            <Wallet className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400">
            {formatMoney(totalDeductions, sym)}
          </p>
        </div>

        <div className="card p-4 flex flex-col justify-between col-span-2 lg:col-span-1 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Take-Home</span>
            <Banknote className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalNet, sym)}
          </p>
        </div>
      </div>

      {/* ── Statutory Deductions Reconciliation Bar ── */}
      {deductionBreakdown.length > 0 && (
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>Statutory Triad & Tax Breakdown (This Run)</span>
            </h4>
            <span className="text-[11px] text-[var(--text-muted)]">
              Total: {formatMoney(totalDeductions, sym)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {deductionBreakdown.map((d) => (
              <div
                key={d.name}
                className="rounded-xl p-2.5 border"
                style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
              >
                <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">{d.name}</p>
                <p className="text-sm font-bold font-mono text-red-600 dark:text-red-400 mt-0.5">
                  {formatMoney(d.total, sym)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Employee Payroll Line Items Table ── */}
      <div className="card flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Employee Payroll Register
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Itemized basic rates, DOLE overtime, statutory deductions, and net take-home pay
            </p>
          </div>
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
            {items.length} {items.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {(status === 'draft' || status === 'cancelled') && !hasItems ? (
          <div className="p-8">
            <EmptyState
              title={status === 'cancelled' ? 'This payroll was cancelled' : 'Payroll not yet computed'}
              message={
                status === 'cancelled'
                  ? 'This record is retained for official DOLE audit history.'
                  : 'Click "Calculate Run" above to compute basic pay, overtime, and statutory contributions for all enrolled employees.'
              }
            />
          </div>
        ) : hasItems ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="th">Employee</th>
                  <th className="th text-right">Basic Pay</th>
                  <th className="th text-right">OT / Extra</th>
                  <th className="th text-right">Gross Pay</th>
                  <th className="th text-right">Deductions</th>
                  <th className="th text-right">Net Take-Home</th>
                  <th className="th text-right">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const extraEarnings =
                    Number(i.overtime) + Number(i.allowances) + Number(i.bonuses) + Number(i.commissions) + Number(i.other_earnings);
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
                            <p className="text-xs text-[var(--text-muted)] font-mono">
                              {String(i.emp_code)} • {String(i.position || 'Staff')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="td text-right font-mono text-[var(--text-secondary)]">
                        {formatMoney(i.basic_pay, sym)}
                      </td>
                      <td className="td text-right font-mono text-[var(--text-secondary)]">
                        {extraEarnings > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{formatMoney(extraEarnings, sym)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="td text-right font-semibold font-mono text-[var(--text-primary)]">
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
                          href={`/app/payslips/${i.id}?payroll=${id}`}
                          className="btn-ghost p-1.5 text-xs font-semibold hover:text-[var(--accent)]"
                        >
                          <FileText className="h-3.5 w-3.5 inline mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold" style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}>
                  <td className="td font-bold text-[var(--text-primary)]">TOTAL DISBURSAL</td>
                  <td className="td" />
                  <td className="td text-right font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(totalOvertime, sym)}
                  </td>
                  <td className="td text-right font-mono text-[var(--text-primary)]">
                    {formatMoney(totalGross, sym)}
                  </td>
                  <td className="td text-right font-mono text-red-600 dark:text-red-400">
                    -{formatMoney(totalDeductions, sym)}
                  </td>
                  <td className="td text-right font-mono text-emerald-600 dark:text-emerald-400 text-base">
                    {formatMoney(totalNet, sym)}
                  </td>
                  <td className="td" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}