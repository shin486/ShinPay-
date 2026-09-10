'use server';

import { init } from '../init';
import { all } from '../db';
import { getSettings, getSettingsAsync } from '../settings';
import { toCsv } from '../csv';
import { createClient, isSupabaseConfigured } from '../supabase/server';
import { getCurrentUser } from '../auth';

export interface ActionResult {
  ok: boolean;
  error?: string;
  csv?: string;
  filename?: string;
}

function mapRow(headers: string[], row: Record<string, unknown>): Record<string, unknown> {
  return headers.reduce((acc, h) => {
    acc[h] = row[h];
    return acc;
  }, {} as Record<string, unknown>);
}

/** CSV export of the payroll list. */
export async function exportPayrollsCsvAction(): Promise<ActionResult> {
  const user = await getCurrentUser();
  const orgId = user?.organization_id;

  if (isSupabaseConfigured() && orgId) {
    const supabase = createClient();
    const settings = await getSettingsAsync();
    const s = settings.currency_symbol || '₱';

    const headers = [
      'id',
      'business',
      'period_start',
      'period_end',
      'pay_date',
      'status',
      'employees',
      'gross',
      'deductions',
      'net',
    ];

    const { data: payrolls } = await supabase
      .from('payroll')
      .select('id, payroll_period_start, payroll_period_end, pay_date, status, employee_count, total_gross, total_deductions, total_net, businesses(name)')
      .eq('organization_id', orgId)
      .order('payroll_period_end', { ascending: false });

    const rows = (payrolls || []).map((p: any) => ({
      id: p.id,
      business: p.businesses?.name || 'Business',
      period_start: p.payroll_period_start,
      period_end: p.payroll_period_end,
      pay_date: p.pay_date,
      status: p.status,
      employees: p.employee_count,
      gross: `${s}${Number(p.total_gross).toFixed(2)}`,
      deductions: `${s}${Number(p.total_deductions).toFixed(2)}`,
      net: `${s}${Number(p.total_net).toFixed(2)}`,
    }));

    const mapped = rows.map((r) => mapRow(headers, r));
    return { ok: true, csv: toCsv(mapped, headers), filename: 'payrolls.csv' };
  }

  // SQLite fallback
  init();
  const s = getSettings().currency_symbol || '₱';
  const headers = [
    'id',
    'business',
    'period_start',
    'period_end',
    'pay_date',
    'status',
    'employees',
    'gross',
    'deductions',
    'net',
  ];
  const rows = all(
    `SELECT p.id, b.name AS business, p.payroll_period_start, p.payroll_period_end,
            p.pay_date, p.status, p.employee_count, p.total_gross, p.total_deductions, p.total_net
     FROM payroll p JOIN businesses b ON b.id = p.business_id
     ORDER BY p.payroll_period_end DESC`
  ).map((r) => ({
    id: r['id'],
    business: r['business'],
    period_start: r['payroll_period_start'],
    period_end: r['payroll_period_end'],
    pay_date: r['pay_date'],
    status: r['status'],
    employees: r['employee_count'],
    gross: `${s}${Number(r['total_gross']).toFixed(2)}`,
    deductions: `${s}${Number(r['total_deductions']).toFixed(2)}`,
    net: `${s}${Number(r['total_net']).toFixed(2)}`,
  }));
  const mapped = rows.map((r) => mapRow(headers, r));
  return { ok: true, csv: toCsv(mapped, headers), filename: 'payrolls.csv' };
}

/** CSV export of the payroll detail (items) for a specific payroll id. */
export async function exportPayrollDetailCsvAction(payrollId: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  const orgId = user?.organization_id;

  if (isSupabaseConfigured() && orgId) {
    const supabase = createClient();
    const settings = await getSettingsAsync();
    const s = settings.currency_symbol || '₱';

    const headers = [
      'employee_id',
      'name',
      'basic',
      'overtime',
      'allowances',
      'bonuses',
      'commissions',
      'other',
      'gross',
      'deductions',
      'net',
    ];

    const { data: items } = await supabase
      .from('payroll_items')
      .select('*, employees(employee_id, first_name, last_name)')
      .eq('payroll_id', payrollId)
      .eq('organization_id', orgId);

    const rows = (items || []).map((pi: any) => ({
      employee_id: pi.employees?.employee_id || '',
      name: `${pi.employees?.first_name || ''} ${pi.employees?.last_name || ''}`.trim(),
      basic: `${s}${Number(pi.basic_pay).toFixed(2)}`,
      overtime: `${s}${Number(pi.overtime).toFixed(2)}`,
      allowances: `${s}${Number(pi.allowances).toFixed(2)}`,
      bonuses: `${s}${Number(pi.bonuses).toFixed(2)}`,
      commissions: `${s}${Number(pi.commissions).toFixed(2)}`,
      other: `${s}${Number(pi.other_earnings).toFixed(2)}`,
      gross: `${s}${Number(pi.gross_pay).toFixed(2)}`,
      deductions: `${s}${Number(pi.total_deductions).toFixed(2)}`,
      net: `${s}${Number(pi.net_pay).toFixed(2)}`,
    }));

    const mapped = rows.map((r) => mapRow(headers, r));
    return {
      ok: true,
      csv: toCsv(mapped, headers),
      filename: `payroll-${payrollId}.csv`,
    };
  }

  init();
  const s = getSettings().currency_symbol || '₱';
  const headers = [
    'employee_id',
    'name',
    'basic',
    'overtime',
    'allowances',
    'bonuses',
    'commissions',
    'other',
    'gross',
    'deductions',
    'net',
  ];
  const rows = all(
    `SELECT pi.employee_id, e.employee_id AS emp_id, e.first_name, e.last_name,
            pi.basic_pay, pi.overtime, pi.allowances, pi.bonuses, pi.commissions,
            pi.other_earnings, pi.gross_pay, pi.total_deductions, pi.net_pay
     FROM payroll_items pi JOIN employees e ON e.id = pi.employee_id
     WHERE pi.payroll_id = ?
     ORDER BY e.last_name`,
    payrollId
  ).map((r) => ({
    employee_id: r['emp_id'],
    name: `${r['first_name']} ${r['last_name']}`,
    basic: `${s}${Number(r['basic_pay']).toFixed(2)}`,
    overtime: `${s}${Number(r['overtime']).toFixed(2)}`,
    allowances: `${s}${Number(r['allowances']).toFixed(2)}`,
    bonuses: `${s}${Number(r['bonuses']).toFixed(2)}`,
    commissions: `${s}${Number(r['commissions']).toFixed(2)}`,
    other: `${s}${Number(r['other_earnings']).toFixed(2)}`,
    gross: `${s}${Number(r['gross_pay']).toFixed(2)}`,
    deductions: `${s}${Number(r['total_deductions']).toFixed(2)}`,
    net: `${s}${Number(r['net_pay']).toFixed(2)}`,
  }));
  const mapped = rows.map((r) => mapRow(headers, r));
  return {
    ok: true,
    csv: toCsv(mapped, headers),
    filename: `payroll-${payrollId}.csv`,
  };
}