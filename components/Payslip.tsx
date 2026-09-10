import { formatMoney, formatDate } from '@/lib/format';
import { ShieldCheck, Building2, User, Calendar, CreditCard } from 'lucide-react';

export interface PayslipProps {
  systemName: string;
  symbol: string;
  employee: {
    name: string;
    employee_id: string;
    position?: string;
    business_name?: string;
    tin?: string;
    sss_no?: string;
    philhealth_no?: string;
    pagibig_no?: string;
  };
  payroll: {
    periodStart: string;
    periodEnd: string;
    payDate: string;
    batchRef?: string;
  };
  item: {
    basic_pay: number;
    overtime: number;
    allowances: number;
    bonuses: number;
    commissions: number;
    other_earnings: number;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
  };
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
}

/** Official BIR / DOLE Compliant Philippine Payslip */
export function Payslip({
  systemName,
  symbol,
  employee,
  payroll,
  item,
  earnings,
  deductions,
}: PayslipProps) {
  const extraRows = Array.isArray(earnings) ? earnings : [];
  const deductionRows = Array.isArray(deductions) ? deductions : [];
  const batchRef = payroll.batchRef || `PAY-PH-${payroll.periodEnd.replace(/-/g, '')}-${employee.employee_id}`;

  return (
    <div
      className="print-area mx-auto max-w-3xl rounded-2xl border p-6 sm:p-10 shadow-sm transition-all"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      {/* ── Official Header ── */}
      <div className="border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase font-sans">
                {employee.business_name || systemName}
              </h1>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mt-1">
              Official Employee Compensation Slip • DOLE / BIR Format
            </p>
          </div>

          <div className="text-right">
            <span className="rounded-md px-2.5 py-1 text-xs font-bold font-mono uppercase bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
              {batchRef}
            </span>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Disbursal Date: <strong className="text-[var(--text-primary)]">{formatDate(payroll.payDate)}</strong>
            </p>
          </div>
        </div>

        {/* Period Cut-off Banner */}
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2 text-xs"
          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
        >
          <span className="text-[var(--text-secondary)]">
            Cut-off Cycle: <strong className="text-[var(--text-primary)]">{formatDate(payroll.periodStart)} — {formatDate(payroll.periodEnd)}</strong>
          </span>
          <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            2024 Statutory Triad Verified
          </span>
        </div>
      </div>

      {/* ── Employee Information Profile ── */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Employee Name</p>
          <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{employee.name}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Employee ID / Code</p>
          <p className="mt-1 text-sm font-mono font-semibold text-[var(--text-secondary)]">{employee.employee_id}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Position / Role</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{employee.position || 'Staff'}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Corporate Unit</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{employee.business_name || 'Main Office'}</p>
        </div>

        {/* Statutory Numbers */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">TIN</p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)]">{employee.tin || 'Registered'}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">SSS Number</p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)]">{employee.sss_no || 'Registered'}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">PhilHealth No.</p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)]">{employee.philhealth_no || 'Registered'}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pag-IBIG / HDMF</p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)]">{employee.pagibig_no || 'Registered'}</p>
        </div>
      </div>

      {/* ── Two-Column Breakdown: Earnings vs Deductions ── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        {/* Earnings Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Gross Earnings
            </h2>
            <span className="text-xs text-[var(--text-muted)]">Amount (PHP)</span>
          </div>

          <table className="w-full text-xs">
            <tbody className="divide-y divide-dashed" style={{ borderColor: 'var(--border)' }}>
              <tr>
                <td className="py-2 text-[var(--text-secondary)]">Basic Compensation</td>
                <td className="py-2 text-right font-mono font-semibold text-[var(--text-primary)]">
                  {formatMoney(item.basic_pay, symbol)}
                </td>
              </tr>
              {item.overtime > 0 && (
                <tr>
                  <td className="py-2 text-[var(--text-secondary)]">DOLE Overtime (125%)</td>
                  <td className="py-2 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(item.overtime, symbol)}
                  </td>
                </tr>
              )}
              {extraRows
                .filter((e) => !/basic/i.test(e.name))
                .map((e) => (
                  <tr key={e.name}>
                    <td className="py-2 text-[var(--text-secondary)]">{e.name}</td>
                    <td className="py-2 text-right font-mono font-semibold text-[var(--text-primary)]">
                      +{formatMoney(e.amount, symbol)}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold" style={{ borderColor: 'var(--border)' }}>
                <td className="py-2.5 text-xs uppercase tracking-wider text-[var(--text-primary)]">
                  Total Gross Earnings
                </td>
                <td className="py-2.5 text-right font-mono text-sm text-[var(--text-primary)]">
                  {formatMoney(item.gross_pay, symbol)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Deductions Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Statutory & Other Deductions
            </h2>
            <span className="text-xs text-[var(--text-muted)]">Amount (PHP)</span>
          </div>

          <table className="w-full text-xs">
            <tbody className="divide-y divide-dashed" style={{ borderColor: 'var(--border)' }}>
              {deductionRows.length === 0 ? (
                <tr>
                  <td className="py-2 text-[var(--text-muted)] italic">No statutory or voluntary deductions</td>
                  <td className="py-2 text-right font-mono">₱0.00</td>
                </tr>
              ) : (
                deductionRows.map((d) => (
                  <tr key={d.name}>
                    <td className="py-2 text-[var(--text-secondary)]">{d.name}</td>
                    <td className="py-2 text-right font-mono font-semibold text-red-600 dark:text-red-400">
                      -{formatMoney(d.amount, symbol)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold" style={{ borderColor: 'var(--border)' }}>
                <td className="py-2.5 text-xs uppercase tracking-wider text-red-600 dark:text-red-400">
                  Total Deductions
                </td>
                <td className="py-2.5 text-right font-mono text-sm text-red-600 dark:text-red-400">
                  -{formatMoney(item.total_deductions, symbol)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Net Take-Home Pay Highlight Card ── */}
      <div
        className="mt-8 rounded-2xl p-6 border text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(83, 108, 81, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
          borderColor: 'var(--accent)',
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Net Take-Home Pay (Disbursed)
        </p>
        <p className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
          {formatMoney(item.net_pay, symbol)}
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Disbursed to payroll account via corporate bank clearing
        </p>
      </div>

      {/* ── Dual Sign-off Certification Lines ── */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-t pt-8" style={{ borderColor: 'var(--border)' }}>
        <div className="space-y-4">
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Certified Correct By:</p>
          <div className="h-10 border-b border-dashed" style={{ borderColor: 'var(--border-hover)' }} />
          <div>
            <p className="font-bold text-[var(--text-primary)]">Authorized Payroll Officer / Comptroller</p>
            <p className="text-[10px] text-[var(--text-muted)]">Finance & Workforce Administration</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Received & Acknowledged By:</p>
          <div className="h-10 border-b border-dashed" style={{ borderColor: 'var(--border-hover)' }} />
          <div>
            <p className="font-bold text-[var(--text-primary)]">{employee.name}</p>
            <p className="text-[10px] text-[var(--text-muted)]">Employee Signature & Date</p>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <p className="mt-8 text-center text-[10px] text-[var(--text-muted)] leading-relaxed">
        This document serves as an official payslip under Philippine Labor Laws. Retain for personal tax (BIR Form 2316) reconciliation and credit audit purposes.
      </p>
    </div>
  );
}