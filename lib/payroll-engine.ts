import { all, get, run, transaction } from './db';
import { getSettings, getSettingsAsync, type SettingsMap } from './settings';
import { getCurrentUser } from './auth';
import { recordAudit } from './audit';
import { round2 } from './format';
import { createClient, isSupabaseConfigured } from './supabase/server';

/**
 * Payroll Calculation Engine
 * All payroll math lives here, separated from the UI. Rules are driven by the
 * database (settings + configured earnings/deductions), so they can be updated
 * without code changes. Finalized amounts are snapshotted into the payroll
 * tables so historical records never change when configuration changes.
 */

const YEARLY_PERIODS: Record<string, number> = {
  monthly: 12,
  'semi-monthly': 24,
  'bi-weekly': 26,
  weekly: 52,
};

function yearlyPeriods(freq: string): number {
  return YEARLY_PERIODS[freq] ?? 24;
}

const STATUTORY_NAMES = ['sss', 'philhealth', 'pag-ibig', 'withholding tax'];

function isStatutory(name: string): boolean {
  const n = name.toLowerCase();
  return STATUTORY_NAMES.some((s) => n.includes(s));
}

/** Map an earning type name to its payroll_item bucket. */
export function earningBucket(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('basic')) return 'basic';
  if (n.includes('overtim') || n.includes('ot')) return 'overtime';
  if (n.includes('bonus')) return 'bonuses';
  if (n.includes('commission')) return 'commissions';
  if (n.includes('allow') || n.includes('transport') || n.includes('meal') || n.includes('transpo')) return 'allowances';
  return 'other_earnings';
}

export function countWorkingDays(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export interface SalaryRow { id: number; salary_type: string; basic_rate: number; payroll_frequency: string; }
export interface EarningRow {
  id: number; name: string; amount: number; calculation_type: string;
  frequency: string; effective_date: string | null; one_time: number; status: string;
}
export interface DeductionRow {
  id: number; name: string; amount: number; calculation_type: string;
  frequency: string; effective_date: string | null; end_date: string | null; status: string;
}
export interface EmployeeRow {
  id: number; employee_id: string; first_name: string; middle_name: string | null;
  last_name: string; suffix: string | null; position: string | null;
}
export interface ComputedEarning { id: number | null; name: string; amount: number; bucket: string; }
export interface ComputedDeduction { id: number | null; name: string; amount: number; }
export interface ComputedItem {
  employee: EmployeeRow; basic_pay: number; overtime: number; allowances: number;
  bonuses: number; commissions: number; other_earnings: number; gross_pay: number;
  total_deductions: number; net_pay: number; earnings: ComputedEarning[]; deductions: ComputedDeduction[];
}

/** Prorate a monthly-stated amount to the actual payroll frequency. */
function toPeriodAmount(amountMonthly: number, payrollFreq: string, amountFreq: string): number {
  const periods = yearlyPeriods(amountFreq) / yearlyPeriods(payrollFreq);
  return round2(amountMonthly / periods);
}

/** The latest active salary for an employee (salary history preserved). */
function getSalary(employeeId: number): SalaryRow | null {
  const row = get(
    "SELECT * FROM employee_salary WHERE employee_id = ? ORDER BY COALESCE(effective_date, '0000-01-01') DESC, id DESC LIMIT 1",
    employeeId
  );
  return row ? (row as unknown as SalaryRow) : null;
}

function getEarnings(employeeId: number): EarningRow[] {
  const rows = all(
    "SELECT ee.*, et.name FROM employee_earnings ee JOIN earning_types et ON et.id = ee.earning_type_id WHERE ee.employee_id = ? AND ee.status = 'active'",
    employeeId
  );
  return rows as unknown as EarningRow[];
}

function getDeductions(employeeId: number): DeductionRow[] {
  const rows = all(
    "SELECT ed.*, dt.name FROM employee_deductions ed JOIN deduction_types dt ON dt.id = ed.deduction_type_id WHERE ed.employee_id = ? AND ed.status = 'active'",
    employeeId
  );
  return rows as unknown as DeductionRow[];
}

function computeBasicPay(salary: SalaryRow | null, periodStart: string, periodEnd: string, payrollFreq: string): number {
  if (!salary) return 0;
  switch (salary.salary_type) {
    case 'daily': return round2(salary.basic_rate * countWorkingDays(periodStart, periodEnd));
    case 'hourly': return round2(salary.basic_rate * countWorkingDays(periodStart, periodEnd) * 8);
    case 'monthly':
    default: return round2((salary.basic_rate * 12) / yearlyPeriods(payrollFreq));
  }
}

/**
 * Compute a single employee's payroll for a period given their salary, earnings, and deductions.
 */
export function computeEmployeeFromData(
  emp: EmployeeRow,
  salary: SalaryRow | null,
  empEarnings: EarningRow[],
  dedRows: DeductionRow[],
  periodStart: string,
  periodEnd: string,
  payrollFreq: string,
  settings: SettingsMap
): ComputedItem {
  const basic_pay = computeBasicPay(salary, periodStart, periodEnd, payrollFreq);

  // Earnings
  const earnings: ComputedEarning[] = [];
  const buckets = { overtime: 0, allowances: 0, bonuses: 0, commissions: 0, other_earnings: 0 };

  for (const e of empEarnings) {
    const bucket = earningBucket(e.name);
    if (bucket === 'basic') continue; // captured by basic_pay
    let amount = 0;
    if (e.one_time) {
      if (e.effective_date && e.effective_date >= periodStart && e.effective_date <= periodEnd) {
        amount = e.calculation_type === 'percentage' ? (basic_pay * e.amount) / 100 : e.amount;
      }
    } else if (e.calculation_type === 'percentage') {
      amount = (basic_pay * e.amount) / 100;
    } else {
      amount = toPeriodAmount(e.amount, payrollFreq, e.frequency);
    }
    amount = round2(amount);
    if (amount !== 0) {
      earnings.push({ id: e.id, name: e.name, amount, bucket });
      if (bucket !== 'basic') buckets[bucket as keyof typeof buckets] += amount;
    }
  }

  const grossPay = round2(
    basic_pay + buckets.overtime + buckets.allowances + buckets.bonuses + buckets.commissions + buckets.other_earnings
  );

  // Deductions
  const deductions: ComputedDeduction[] = [];
  let totalDed = 0;

  const explicitStatutory = dedRows.filter((d) => isStatutory(d.name));
  const otherDeductions = dedRows.filter((d) => !isStatutory(d.name));

  // Global statutory rates unless the employee has an explicit override.
  const statutoryTypes: Array<{ name: string; calc: string; amount: number; key: string }> = [];
  if (settings.sss_rate && Number(settings.sss_rate) > 0)
    statutoryTypes.push({ name: 'SSS', calc: 'percentage', amount: Number(settings.sss_rate), key: 'sss' });
  if (settings.philhealth_rate && Number(settings.philhealth_rate) > 0)
    statutoryTypes.push({ name: 'PhilHealth', calc: 'percentage', amount: Number(settings.philhealth_rate), key: 'philhealth' });
  if (settings.pagibig_amount && Number(settings.pagibig_amount) > 0)
    statutoryTypes.push({ name: 'Pag-IBIG', calc: 'fixed', amount: Number(settings.pagibig_amount), key: 'pagibig' });
  if (settings.tax_rate && Number(settings.tax_rate) > 0)
    statutoryTypes.push({ name: 'Withholding Tax', calc: 'percentage', amount: Number(settings.tax_rate), key: 'tax' });

  for (const st of statutoryTypes) {
    const override = explicitStatutory.find((d) => d.name.toLowerCase().includes(st.key));
    let value: number;
    if (override) {
      value = st.calc === 'percentage'
        ? (grossPay * override.amount) / 100
        : toPeriodAmount(override.amount, payrollFreq, override.frequency);
    } else {
      value = st.calc === 'percentage'
        ? (grossPay * st.amount) / 100
        : toPeriodAmount(st.amount, payrollFreq, 'monthly');
    }
    value = round2(value);
    if (value !== 0) {
      deductions.push({ id: override ? override.id : null, name: st.name, amount: value });
      totalDed += value;
    }
  }

  for (const d of otherDeductions) {
    const inEffect =
      (!d.effective_date || d.effective_date <= periodEnd) &&
      (!d.end_date || d.end_date >= periodStart);
    if (!inEffect) continue;
    const value = round2(
      d.calculation_type === 'percentage'
        ? (grossPay * d.amount) / 100
        : toPeriodAmount(d.amount, payrollFreq, d.frequency)
    );
    if (value !== 0) {
      deductions.push({ id: d.id, name: d.name, amount: value });
      totalDed += value;
    }
  }

  totalDed = round2(totalDed);
  const netPay = round2(grossPay - totalDed);

  return {
    employee: emp,
    basic_pay,
    overtime: round2(buckets.overtime),
    allowances: round2(buckets.allowances),
    bonuses: round2(buckets.bonuses),
    commissions: round2(buckets.commissions),
    other_earnings: round2(buckets.other_earnings),
    gross_pay: grossPay,
    total_deductions: totalDed,
    net_pay: netPay,
    earnings,
    deductions,
  };
}

/**
 * Compute a single employee's payroll for a period (synchronous SQLite).
 */
export function computeEmployee(
  emp: EmployeeRow,
  periodStart: string,
  periodEnd: string,
  payrollFreq: string,
  settings: SettingsMap
): ComputedItem {
  const salary = getSalary(emp.id);
  const empEarnings = getEarnings(emp.id);
  const dedRows = getDeductions(emp.id);
  return computeEmployeeFromData(emp, salary, empEarnings, dedRows, periodStart, periodEnd, payrollFreq, settings);
}

/**
 * Recalculate a payroll (status draft/calculated/for review only).
 * Destroys existing items and stores fresh snapshots.
 * Supports Supabase and SQLite.
 */
export async function calculatePayroll(payrollId: number): Promise<{
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
}> {
  const user = await getCurrentUser();
  const orgId = user?.organization_id ?? null;

  // 1. Supabase execution
  if (isSupabaseConfigured() && orgId) {
    const supabase = createClient();
    const { data: payroll, error: payErr } = await supabase
      .from('payroll')
      .select('*')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (payErr || !payroll) throw new Error('Payroll not found');
    const status = String(payroll.status);
    if (status === 'finalized' || status === 'cancelled') {
      throw new Error('Cannot recalculate a ' + status + ' payroll');
    }

    const businessId = Number(payroll.business_id);
    const periodStart = String(payroll.payroll_period_start);
    const periodEnd = String(payroll.payroll_period_end);
    const payrollFreq = String(payroll.payroll_frequency);
    const settings = await getSettingsAsync();

    const { data: employees } = await supabase
      .from('employees')
      .select('id, employee_id, first_name, middle_name, last_name, suffix, position')
      .eq('business_id', businessId)
      .eq('organization_id', orgId)
      .eq('status', 'active');

    const empList = (employees || []) as unknown as EmployeeRow[];
    const results: ComputedItem[] = [];

    for (const emp of empList) {
      const { data: salRow } = await supabase
        .from('employee_salary')
        .select('*')
        .eq('employee_id', emp.id)
        .order('effective_date', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: earnRows } = await supabase
        .from('employee_earnings')
        .select('*, earning_types(name)')
        .eq('employee_id', emp.id)
        .eq('status', 'active');

      const { data: dedRows } = await supabase
        .from('employee_deductions')
        .select('*, deduction_types(name)')
        .eq('employee_id', emp.id)
        .eq('status', 'active');

      const mappedEarnings: EarningRow[] = (earnRows || []).map((e: any) => ({
        id: e.id,
        name: e.earning_types?.name || 'Allowance',
        amount: Number(e.amount),
        calculation_type: e.calculation_type,
        frequency: e.frequency,
        effective_date: e.effective_date,
        one_time: e.one_time,
        status: e.status,
      }));

      const mappedDeductions: DeductionRow[] = (dedRows || []).map((d: any) => ({
        id: d.id,
        name: d.deduction_types?.name || 'Deduction',
        amount: Number(d.amount),
        calculation_type: d.calculation_type,
        frequency: d.frequency,
        effective_date: d.effective_date,
        end_date: d.end_date,
        status: d.status,
      }));

      const computed = computeEmployeeFromData(
        emp,
        salRow as unknown as SalaryRow | null,
        mappedEarnings,
        mappedDeductions,
        periodStart,
        periodEnd,
        payrollFreq,
        settings
      );
      results.push(computed);
    }

    // Delete existing items
    await supabase.from('payroll_items').delete().eq('payroll_id', payrollId);

    // Insert computed items
    for (const r of results) {
      const { data: itemData } = await supabase
        .from('payroll_items')
        .insert({
          organization_id: orgId,
          payroll_id: payrollId,
          employee_id: r.employee.id,
          basic_pay: r.basic_pay,
          overtime: r.overtime,
          allowances: r.allowances,
          bonuses: r.bonuses,
          commissions: r.commissions,
          other_earnings: r.other_earnings,
          gross_pay: r.gross_pay,
          total_deductions: r.total_deductions,
          net_pay: r.net_pay,
        })
        .select('id')
        .single();

      if (itemData) {
        const itemId = Number(itemData.id);
        for (const e of r.earnings) {
          await supabase.from('payroll_item_earnings').insert({
            payroll_item_id: itemId,
            earning_type_id: e.id,
            name: e.name,
            amount: e.amount,
          });
        }
        for (const d of r.deductions) {
          await supabase.from('payroll_item_deductions').insert({
            payroll_item_id: itemId,
            deduction_type_id: d.id,
            name: d.name,
            amount: d.amount,
          });
        }
      }
    }

    const totalGross = round2(results.reduce((s, r) => s + r.gross_pay, 0));
    const totalDeductions = round2(results.reduce((s, r) => s + r.total_deductions, 0));
    const totalNet = round2(results.reduce((s, r) => s + r.net_pay, 0));
    const employeeCount = results.length;

    await supabase
      .from('payroll')
      .update({
        status: 'calculated',
        employee_count: employeeCount,
        total_gross: totalGross,
        total_deductions: totalDeductions,
        total_net: totalNet,
      })
      .eq('id', payrollId);

    recordAudit(user?.id ?? null, 'PAYROLL_CALCULATED', 'payroll', payrollId, {
      employees: employeeCount,
      total_gross: totalGross,
      total_net: totalNet,
    });

    return { employeeCount, totalGross, totalDeductions, totalNet };
  }

  // 2. SQLite fallback
  const payroll = get('SELECT * FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId) as
    | Record<string, unknown>
    | undefined;
  if (!payroll) throw new Error('Payroll not found');
  const status = String(payroll.status);
  if (status === 'finalized' || status === 'cancelled') {
    throw new Error('Cannot recalculate a ' + status + ' payroll');
  }

  const businessId = Number(payroll.business_id);
  const periodStart = String(payroll.payroll_period_start);
  const periodEnd = String(payroll.payroll_period_end);
  const payrollFreq = String(payroll.payroll_frequency);
  const settings = getSettings();

  const employees = all(
    "SELECT e.id, e.employee_id, e.first_name, e.middle_name, e.last_name, e.suffix, e.position FROM employees e WHERE e.business_id = ? AND e.organization_id = ? AND e.status = 'active'",
    businessId
  ) as unknown as EmployeeRow[];

  const results = employees.map((emp) =>
    computeEmployee(emp, periodStart, periodEnd, payrollFreq, settings)
  );

  transaction(() => {
    run('DELETE FROM payroll_items WHERE payroll_id = ?', payrollId);
    for (const r of results) {
      const itemRes = run(
        "INSERT INTO payroll_items (payroll_id, employee_id, basic_pay, overtime, allowances, bonuses, commissions, other_earnings, gross_pay, total_deductions, net_pay) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        payrollId,
        r.employee.id,
        r.basic_pay,
        r.overtime,
        r.allowances,
        r.bonuses,
        r.commissions,
        r.other_earnings,
        r.gross_pay,
        r.total_deductions,
        r.net_pay
      );
      const itemId = itemRes.lastInsertRowid;
      for (const e of r.earnings) {
        run(
          "INSERT INTO payroll_item_earnings (payroll_item_id, earning_type_id, name, amount) VALUES (?, ?, ?, ?)",
          itemId,
          e.id,
          e.name,
          e.amount
        );
      }
      for (const d of r.deductions) {
        run(
          "INSERT INTO payroll_item_deductions (payroll_item_id, deduction_type_id, name, amount) VALUES (?, ?, ?, ?)",
          itemId,
          d.id,
          d.name,
          d.amount
        );
      }
    }
  });

  const totalGross = round2(results.reduce((s, r) => s + r.gross_pay, 0));
  const totalDeductions = round2(results.reduce((s, r) => s + r.total_deductions, 0));
  const totalNet = round2(results.reduce((s, r) => s + r.net_pay, 0));
  const employeeCount = results.length;

  run(
    "UPDATE payroll SET status = 'calculated', employee_count = ?, total_gross = ?, total_deductions = ?, total_net = ? WHERE id = ?",
    employeeCount,
    totalGross,
    totalDeductions,
    totalNet,
    payrollId
  );

  recordAudit(user?.id ?? null, 'PAYROLL_CALCULATED', 'payroll', payrollId, {
    employees: employeeCount,
    total_gross: totalGross,
    total_net: totalNet,
  });

  return { employeeCount, totalGross, totalDeductions, totalNet };
}
