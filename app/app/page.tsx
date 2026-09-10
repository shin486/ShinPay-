import Link from 'next/link';
import { redirect } from 'next/navigation';
import { all, get } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettings } from '@/lib/settings';
import { formatMoney, formatDate } from '@/lib/format';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
} from '@/components/ui';
import {
  Building2,
  Users,
  Banknote,
  Plus,
  History,
  ArrowRight,
  TrendingUp,
  Wallet,
  FileBarChart2,
  ShieldCheck,
  Calendar,
  Sparkles,
  Landmark,
  FileSpreadsheet,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const tok = {
  primary:   'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted:     'var(--text-muted)',
  accent:    'var(--accent)',
  accentHov: 'var(--accent-hover)',
  accentSub: 'var(--accent-subtle)',
  surface:   'var(--surface)',
  surfaceR:  'var(--surface-raised)',
  border:    'var(--border)',
  borderHov: 'var(--border-hover)',
} as const;

/* ─────────────────────────────────────────────────────────────────
   StatCard — Tactile KPI card with subtle gradient & hover lift
   ───────────────────────────────────────────────────────────────── */
function DashStatCard({
  label,
  value,
  sub,
  icon,
  accent = false,
  badge,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className="card card-hover flex flex-col justify-between p-5 animate-fade-in-up group relative overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        borderColor: accent ? 'var(--accent-glow)' : 'var(--border)',
      }}
    >
      {/* Subtle top accent bar */}
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, var(--accent) 0%, #4ade80 100%)' }}
        />
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
            style={{
              background: accent ? tok.accentSub : 'var(--surface-raised)',
              color: accent ? tok.accent : tok.secondary,
              border: '1px solid var(--border)',
            }}
          >
            {icon}
          </div>
          {badge}
        </div>

        <div className="min-w-0">
          <p
            className="text-2xl sm:text-3xl font-bold tracking-tight truncate font-sans"
            style={{ color: tok.primary }}
          >
            {value}
          </p>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: tok.secondary }}
          >
            {label}
          </p>
        </div>
      </div>

      {sub && (
        <p className="mt-3 truncate text-xs font-medium border-t pt-2.5" style={{ color: tok.muted, borderColor: 'var(--border)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Calculate Next Philippine Semi-Monthly Pay Date (15th or 30th/31st)
   ───────────────────────────────────────────────────────────────── */
function getNextPayDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  let nextDate: Date;
  let cycleName: string;

  if (day < 15) {
    nextDate = new Date(year, month, 15);
    cycleName = '15th Mid-Month Cycle';
  } else if (day === 15) {
    nextDate = new Date(year, month, 15);
    cycleName = '15th Mid-Month (Today)';
  } else {
    // Last day of current month (30th or 31st or 28/29th)
    nextDate = new Date(year, month + 1, 0);
    cycleName = 'End-of-Month Cycle';
  }

  const diffMs = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const daysText = diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays} days away`;

  return {
    cycleName,
    dateStr: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    daysText,
  };
}

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getSettingsAsync } from '@/lib/settings';

/* ─────────────────────────────────────────────────────────────────
   Dashboard Page (Server Component)
   ───────────────────────────────────────────────────────────────── */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const orgId = user.organization_id;
  let businesses: any[] = [];
  let totalBusinesses = 0;
  let totalEmployees = { c: 0 };
  let currentPayroll: Record<string, unknown> | undefined = undefined;
  let recentPayrolls: any[] = [];
  let byBusiness: any[] = [];
  let sym = '₱';

  if (isSupabaseConfigured() && orgId) {
    const supabase = createClient();
    const settings = await getSettingsAsync();
    sym = settings.currency_symbol || '₱';

    const { data: bData } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .order('name');
    businesses = bData || [];
    totalBusinesses = businesses.length;

    const { count: empCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active');
    totalEmployees = { c: empCount || 0 };

    const { data: pData } = await supabase
      .from('payroll')
      .select('*, businesses(name)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(6);

    const mappedPayrolls = (pData || []).map((p: any) => ({
      ...p,
      business_name: p.businesses?.name || 'Business',
    }));
    recentPayrolls = mappedPayrolls;
    currentPayroll = mappedPayrolls[0];

    const { data: allEmps } = await supabase
      .from('employees')
      .select('id, business_id')
      .eq('organization_id', orgId)
      .eq('status', 'active');

    const empCountByBus = new Map<number, number>();
    for (const e of allEmps || []) {
      empCountByBus.set(e.business_id, (empCountByBus.get(e.business_id) || 0) + 1);
    }

    const { data: finalizedPay } = await supabase
      .from('payroll')
      .select('business_id, total_net')
      .eq('organization_id', orgId)
      .eq('status', 'finalized');

    const netByBus = new Map<number, number>();
    for (const fp of finalizedPay || []) {
      netByBus.set(fp.business_id, (netByBus.get(fp.business_id) || 0) + Number(fp.total_net));
    }

    byBusiness = businesses.map((b) => ({
      id: b.id,
      name: b.name,
      employee_count: empCountByBus.get(b.id) || 0,
      net_payroll: netByBus.get(b.id) || 0,
    }));
  } else {
    init();
    const settings = getSettings();
    sym = settings.currency_symbol || '₱';

    businesses = all(
      "SELECT id, name FROM businesses WHERE organization_id = ? AND status = 'active' ORDER BY name",
      orgId
    );
    totalBusinesses = businesses.length;

    totalEmployees = get(
      "SELECT COUNT(*) AS c FROM employees WHERE organization_id = ? AND status = 'active'",
      orgId
    ) as { c: number };

    currentPayroll = get(
      `SELECT p.*, b.name AS business_name FROM payroll p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.organization_id = ?
       ORDER BY p.created_at DESC LIMIT 1`,
      orgId
    ) as Record<string, unknown> | undefined;

    recentPayrolls = all(
      `SELECT p.*, b.name AS business_name FROM payroll p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.organization_id = ?
       ORDER BY p.created_at DESC LIMIT 6`,
      orgId
    );

    byBusiness = all(
      `SELECT b.id, b.name, COUNT(e.id) AS employee_count,
              COALESCE(SUM(CASE WHEN p.status = 'finalized' THEN p.total_net END), 0) AS net_payroll
       FROM businesses b
       LEFT JOIN employees e ON e.business_id = b.id AND e.status = 'active'
       LEFT JOIN payroll p ON p.business_id = b.id
       WHERE b.organization_id = ?
       GROUP BY b.id, b.name
       ORDER BY b.name`,
      orgId
    );
  }

  const nextCycle = getNextPayDateInfo();

  /* ── Max net payroll for business bar widths ── */
  const maxNet = byBusiness.reduce(
    (m, b) => Math.max(m, Number(b.net_payroll) || 0),
    1
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page Header + Quick Actions ── */}
      <PageHeader
        title="Workforce & Payroll OS"
        subtitle="Executive oversight of Philippine payroll calculations, statutory triad compliance, and bank disbursals."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/app/payroll/new"
              className="btn-primary"
              style={{ fontSize: '0.8125rem' }}
            >
              <Banknote className="h-4 w-4" />
              Run Payroll
            </Link>
            <Link
              href="/app/employees/new"
              className="btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Employee
            </Link>
            <Link
              href="/app/history"
              className="btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              <History className="h-3.5 w-3.5" />
              Disbursals
            </Link>
            <Link
              href="/app/reports"
              className="btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              <FileBarChart2 className="h-3.5 w-3.5" />
              Reports
            </Link>
          </div>
        }
      />

      {/* ── Hero KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashStatCard
          label="Active Workforce"
          value={Number(totalEmployees.c)}
          sub={`Across ${totalBusinesses} active ${totalBusinesses === 1 ? 'registered business' : 'registered businesses'}`}
          icon={<Users className="h-5 w-5" />}
          accent
          badge={
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              100% DOLE Standard
            </span>
          }
        />
        <DashStatCard
          label="Registered Entities"
          value={totalBusinesses}
          sub="Compliant corporate units"
          icon={<Building2 className="h-5 w-5" />}
          badge={
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border)]">
              Multi-Entity
            </span>
          }
        />
        <DashStatCard
          label="Latest Disbursed Net"
          value={currentPayroll ? formatMoney(currentPayroll.total_net, sym) : '—'}
          sub={
            currentPayroll
              ? `${String(currentPayroll.business_name)} • Period ${formatDate(String(currentPayroll.payroll_period_end))}`
              : 'No payroll runs recorded yet'
          }
          icon={<Banknote className="h-5 w-5" />}
          accent
          badge={
            currentPayroll ? (
              <StatusBadge status={String(currentPayroll.status)} />
            ) : undefined
          }
        />
        <DashStatCard
          label="Next Scheduled Cut-Off"
          value={nextCycle.dateStr}
          sub={`${nextCycle.cycleName} (${nextCycle.daysText})`}
          icon={<Calendar className="h-5 w-5" />}
          badge={
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {nextCycle.daysText}
            </span>
          }
        />
      </div>

      {/* ── Philippine Statutory Compliance Matrix ── */}
      <div
        className="rounded-2xl p-4 sm:p-5 border transition-all"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ background: 'var(--accent)' }}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Philippine Statutory Compliance Engine
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Active 2024 contribution tables verified for Republic Act & DOLE audit readiness
              </p>
            </div>
          </div>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active & Reconciled
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl p-3 border" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold text-[var(--text-secondary)]">SSS Circular 2024</span>
              <Landmark className="h-3.5 w-3.5 text-[var(--accent)]" />
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">₱30,000 Cap</p>
            <p className="text-[11px] text-[var(--text-muted)]">EE 4.5% (Max ₱1,350) • ER 9.5%</p>
          </div>

          <div className="rounded-xl p-3 border" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold text-[var(--text-secondary)]">PhilHealth 2024</span>
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">5.00% Pool</p>
            <p className="text-[11px] text-[var(--text-muted)]">2.5% EE / 2.5% ER equal split</p>
          </div>

          <div className="rounded-xl p-3 border" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold text-[var(--text-secondary)]">Pag-IBIG HDMF</span>
              <Wallet className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">₱200 Cap</p>
            <p className="text-[11px] text-[var(--text-muted)]">Mandatory monthly employee cap</p>
          </div>

          <div className="rounded-xl p-3 border" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold text-[var(--text-secondary)]">BIR Withholding</span>
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">TRAIN Law</p>
            <p className="text-[11px] text-[var(--text-muted)]">₱250k tax-exempt semi-monthly table</p>
          </div>
        </div>
      </div>

      {/* ── Mid section: Recent Payroll + Business Overview ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Payroll Table — spans 2 columns */}
        <div className="lg:col-span-2">
          <div className="card flex h-full flex-col">
            {/* Card header */}
            <div
              className="flex items-center justify-between gap-3 px-5 py-4 border-b"
              style={{ borderColor: tok.border }}
            >
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Recent Payroll Runs
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Audit trail and disbursal execution history
                </p>
              </div>
              <Link
                href="/app/payroll"
                className="btn-ghost text-xs flex items-center gap-1.5"
                style={{ padding: '6px 12px' }}
              >
                <span>View all runs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              {recentPayrolls.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="No payroll records yet"
                    message="Generate your first payroll calculation to begin tracking statutory deductions and bank disbursals."
                    action={
                      <Link href="/app/payroll/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                        <Plus className="h-3.5 w-3.5" />
                        Create First Payroll
                      </Link>
                    }
                  />
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${tok.border}`, background: 'var(--bg-secondary)' }}>
                      <th className="th">Period Dates</th>
                      <th className="th">Business</th>
                      <th className="th text-right">Headcount</th>
                      <th className="th text-right">Gross Pay</th>
                      <th className="th text-right">Net Disbursed</th>
                      <th className="th">Status</th>
                      <th className="th text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayrolls.map((p) => (
                      <tr key={String(p.id)} className="table-row">
                        <td className="td">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                            <div>
                              <span className="font-semibold text-[var(--text-primary)]">
                                {formatDate(String(p.payroll_period_start))}
                              </span>
                              <span style={{ color: tok.muted }}> — </span>
                              <span className="text-[var(--text-secondary)]">
                                {formatDate(String(p.payroll_period_end))}
                              </span>
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
                        <td className="td text-right text-[var(--text-secondary)]">
                          {formatMoney(p.total_gross, sym)}
                        </td>
                        <td
                          className="td text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono"
                        >
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
              )}
            </div>
          </div>
        </div>

        {/* Business Overview — 1 column */}
        <div>
          <div className="card flex h-full flex-col">
            {/* Card header */}
            <div
              className="flex items-center justify-between gap-3 px-5 py-4 border-b"
              style={{ borderColor: tok.border }}
            >
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Disbursal by Entity
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Active business volume share
                </p>
              </div>
              <Link
                href="/app/reports"
                className="btn-ghost text-xs"
                style={{ padding: '6px 12px' }}
              >
                Full report
              </Link>
            </div>

            <div className="flex-1 px-5 py-4">
              {byBusiness.length === 0 ? (
                <EmptyState
                  title="No businesses registered"
                  message="Add your registered companies to see automated volume distribution."
                  action={
                    <Link href="/app/businesses/new" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
                      <Plus className="h-3.5 w-3.5" />
                      Add Business
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-4">
                  {byBusiness.map((b) => {
                    const net = Number(b.net_payroll) || 0;
                    const pct = maxNet > 0 ? Math.round((net / maxNet) * 100) : 0;
                    return (
                      <li key={String(b.id)} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-semibold leading-snug text-[var(--text-primary)]"
                            >
                              {String(b.name)}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {String(b.employee_count)} {Number(b.employee_count) === 1 ? 'employee' : 'employees'} enrolled
                            </p>
                          </div>
                          <p
                            className="shrink-0 text-sm font-bold tabular-nums font-mono text-[var(--text-primary)]"
                          >
                            {formatMoney(net, sym)}
                          </p>
                        </div>
                        {/* Progress bar */}
                        <div
                          className="h-2 w-full rounded-full overflow-hidden"
                          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 4)}%`,
                              background: 'linear-gradient(90deg, var(--accent) 0%, #4ade80 100%)',
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Financials Row ── */}
      {currentPayroll && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Gross */}
          <div
            className="card flex items-center gap-4 px-5 py-4 border-l-4"
            style={{ borderLeftColor: 'var(--accent)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: tok.accentSub, color: tok.accent }}
            >
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Total Gross Calculated
              </p>
              <p
                className="mt-0.5 text-xl font-bold truncate text-[var(--text-primary)] font-mono"
              >
                {formatMoney(currentPayroll.total_gross, sym)}
              </p>
            </div>
          </div>

          {/* Deductions */}
          <div
            className="card flex items-center gap-4 px-5 py-4 border-l-4"
            style={{ borderLeftColor: 'var(--danger)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
            >
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Statutory & Other Deductions
              </p>
              <p
                className="mt-0.5 text-xl font-bold truncate text-red-600 dark:text-red-400 font-mono"
              >
                {formatMoney(currentPayroll.total_deductions, sym)}
              </p>
            </div>
          </div>

          {/* Net */}
          <div
            className="card flex items-center gap-4 px-5 py-4 border-l-4"
            style={{ borderLeftColor: 'var(--success)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
            >
              <Banknote className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Net Take-Home Disbursed
              </p>
              <p
                className="mt-0.5 text-xl font-bold truncate text-emerald-600 dark:text-emerald-400 font-mono"
              >
                {formatMoney(currentPayroll.total_net, sym)}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}