'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../auth';
import { recordAudit } from '../audit';
import { get, run, all } from '../db';
import { firstError, dateRange, required } from '../validators';
import { init } from '../init';
import { calculatePayroll } from '../payroll-engine';
import { requireModule } from '../modules';
import { createClient, isSupabaseConfigured } from '../supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: number;
}

const VALID_STATUSES = ['draft', 'calculated', 'for_review', 'finalized', 'cancelled'];

export interface CreatePayrollInput {
  business_id: string | number;
  payroll_period_start: string;
  payroll_period_end: string;
  pay_date: string;
  payroll_frequency: string;
}

export async function createPayrollAction(input: CreatePayrollInput): Promise<ActionResult> {
  const user = await requireUser();
  if (user.organization_id) {
    await requireModule(user.organization_id, 'payroll');
  }
  const businessId = Number(input.business_id);
  const err = firstError([
    required(input.business_id, 'Business'),
    required(input.payroll_period_start, 'Payroll period start'),
    required(input.payroll_period_end, 'Payroll period end'),
    required(input.pay_date, 'Pay date'),
    required(input.payroll_frequency, 'Payroll frequency'),
    dateRange(input.payroll_period_start, input.payroll_period_end),
    (() => (input.pay_date < input.payroll_period_end ? 'Pay date cannot be before the period end.' : null))(),
  ]);
  if (err) return { ok: false, error: err };

  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization found.' };

  // 1. Supabase execution
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: overlap } = await supabase
      .from('payroll')
      .select('id')
      .eq('business_id', businessId)
      .eq('organization_id', orgId)
      .neq('status', 'cancelled')
      .lte('payroll_period_start', input.payroll_period_end)
      .gte('payroll_period_end', input.payroll_period_start)
      .maybeSingle();

    if (overlap) {
      return {
        ok: false,
        error: 'A payroll already exists for this business with an overlapping period.',
      };
    }

    const { data: newPay, error: insertErr } = await supabase
      .from('payroll')
      .insert({
        organization_id: orgId,
        business_id: businessId,
        payroll_period_start: input.payroll_period_start,
        payroll_period_end: input.payroll_period_end,
        pay_date: input.pay_date,
        payroll_frequency: input.payroll_frequency,
        created_by: typeof user.id === 'string' ? user.id : null,
      })
      .select('id')
      .single();

    if (insertErr || !newPay) {
      return { ok: false, error: insertErr?.message || 'Failed to create payroll.' };
    }

    const id = Number(newPay.id);
    recordAudit(user.id, 'PAYROLL_CREATED', 'payroll', id, {
      business_id: businessId,
      period: [input.payroll_period_start, input.payroll_period_end],
    });

    revalidatePath('/app/payroll');
    revalidatePath('/');
    return { ok: true, id };
  }

  // 2. SQLite fallback
  init();
  const overlap = get(
    `SELECT id FROM payroll
     WHERE business_id = ? AND organization_id = ? AND status != 'cancelled'
       AND payroll_period_start <= ? AND payroll_period_end >= ?`,
    businessId,
    orgId,
    input.payroll_period_end,
    input.payroll_period_start
  );
  if (overlap) {
    return {
      ok: false,
      error: 'A payroll already exists for this business with an overlapping period.',
    };
  }

  const res = run(
    `INSERT INTO payroll (organization_id, business_id, payroll_period_start, payroll_period_end, pay_date, payroll_frequency, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    orgId,
    businessId,
    input.payroll_period_start,
    input.payroll_period_end,
    input.pay_date,
    input.payroll_frequency,
    Number(user.id) || null
  );
  const id = res.lastInsertRowid;
  recordAudit(user.id, 'PAYROLL_CREATED', 'payroll', id, {
    business_id: businessId,
    period: [input.payroll_period_start, input.payroll_period_end],
  });
  revalidatePath('/app/payroll');
  revalidatePath('/');
  return { ok: true, id };
}

export async function calculatePayrollAction(payrollId: number): Promise<ActionResult> {
  await requireUser();
  try {
    await calculatePayroll(payrollId);
    revalidatePath('/app/payroll');
    revalidatePath(`/app/payroll/${payrollId}`);
    revalidatePath('/');
    return { ok: true, id: payrollId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to calculate payroll.';
    return { ok: false, error: msg };
  }
}

export async function setPayrollStatusAction(
  payrollId: number,
  status: string
): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!VALID_STATUSES.includes(status)) return { ok: false, error: 'Invalid status.' };

  if (isSupabaseConfigured() && orgId) {
    const supabase = createClient();
    const { data: payroll } = await supabase
      .from('payroll')
      .select('*')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (!payroll) return { ok: false, error: 'Payroll not found.' };
    const current = String(payroll.status);

    if (status === 'finalized') {
      return { ok: false, error: 'Use Finalize Payroll to set a payroll to finalized.' };
    }
    if (current === 'finalized') {
      return { ok: false, error: 'Finalized payrolls are read-only.' };
    }
    if (current === 'cancelled') {
      return { ok: false, error: 'Cancelled payrolls cannot be changed.' };
    }

    await supabase
      .from('payroll')
      .update({ status })
      .eq('id', payrollId);

    recordAudit(user.id, 'PAYROLL_STATUS', 'payroll', payrollId, { from: current, to: status });
    revalidatePath('/app/payroll');
    revalidatePath(`/app/payroll/${payrollId}`);
    return { ok: true };
  }

  // SQLite fallback
  init();
  const payroll = get('SELECT * FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId) as
    | Record<string, unknown>
    | undefined;
  if (!payroll) return { ok: false, error: 'Payroll not found.' };
  const current = String(payroll.status);

  if (status === 'finalized') {
    return { ok: false, error: 'Use Finalize Payroll to set a payroll to finalized.' };
  }
  if (current === 'finalized') {
    return { ok: false, error: 'Finalized payrolls are read-only.' };
  }
  if (current === 'cancelled') {
    return { ok: false, error: 'Cancelled payrolls cannot be changed.' };
  }

  run('UPDATE payroll SET status = ? WHERE id = ?', status, payrollId);
  recordAudit(user.id, 'PAYROLL_STATUS', 'payroll', payrollId, { from: current, to: status });
  revalidatePath('/app/payroll');
  revalidatePath(`/app/payroll/${payrollId}`);
  return { ok: true };
}

export async function finalizePayrollAction(payrollId: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: payroll } = await supabase
      .from('payroll')
      .select('*')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (!payroll) return { ok: false, error: 'Payroll not found.' };
    const current = String(payroll.status);
    if (current === 'finalized') return { ok: false, error: 'Payroll is already finalized.' };
    if (current === 'cancelled') return { ok: false, error: 'Cancelled payrolls cannot be finalized.' };

    let gross = Number(payroll.total_gross) || 0;
    let count = Number(payroll.employee_count) || 0;
    if (current === 'draft' || gross === 0) {
      try {
        const res = await calculatePayroll(payrollId);
        gross = res.totalGross;
        count = res.employeeCount;
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : 'Could not calculate payroll.' };
      }
    }

    await supabase
      .from('payroll')
      .update({
        status: 'finalized',
        finalized_by: typeof user.id === 'string' ? user.id : null,
        finalized_at: new Date().toISOString(),
      })
      .eq('id', payrollId);

    // Automatically generate payslip stubs for finalized items
    const { data: items } = await supabase
      .from('payroll_items')
      .select('id, employee_id')
      .eq('payroll_id', payrollId);

    for (const item of items || []) {
      await supabase.from('payslips').insert({
        organization_id: orgId,
        payroll_id: payrollId,
        payroll_item_id: item.id,
        employee_id: item.employee_id,
        generated_by: typeof user.id === 'string' ? user.id : null,
      });
    }

    recordAudit(user.id, 'PAYROLL_FINALIZED', 'payroll', payrollId, {
      total_gross: gross,
      employees: count,
    });
    revalidatePath('/app/payroll');
    revalidatePath(`/app/payroll/${payrollId}`);
    revalidatePath('/');
    revalidatePath('/app/history');
    return { ok: true };
  }

  // SQLite fallback
  init();
  const payroll = get('SELECT * FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId) as
    | Record<string, unknown>
    | undefined;
  if (!payroll) return { ok: false, error: 'Payroll not found.' };
  const current = String(payroll.status);
  if (current === 'finalized') return { ok: false, error: 'Payroll is already finalized.' };
  if (current === 'cancelled') return { ok: false, error: 'Cancelled payrolls cannot be finalized.' };

  let gross = Number(payroll.total_gross) || 0;
  let count = Number(payroll.employee_count) || 0;
  if (current === 'draft' || gross === 0) {
    try {
      const res = await calculatePayroll(payrollId);
      gross = res.totalGross;
      count = res.employeeCount;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Could not calculate payroll.' };
    }
  }

  run(
    `UPDATE payroll SET status = 'finalized', finalized_by = ?, finalized_at = datetime('now')
     WHERE id = ? AND organization_id = ?`,
    Number(user.id) || null,
    payrollId,
    orgId
  );
  recordAudit(user.id, 'PAYROLL_FINALIZED', 'payroll', payrollId, {
    total_gross: gross,
    employees: count,
  });
  revalidatePath('/app/payroll');
  revalidatePath(`/app/payroll/${payrollId}`);
  revalidatePath('/');
  revalidatePath('/app/history');
  return { ok: true };
}

export async function deletePayrollAction(payrollId: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: payroll } = await supabase
      .from('payroll')
      .select('status')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (!payroll) return { ok: false, error: 'Payroll not found.' };
    if (payroll.status !== 'draft') {
      return { ok: false, error: 'Only draft payrolls can be deleted. Cancel others first.' };
    }

    await supabase.from('payroll').delete().eq('id', payrollId);
    recordAudit(user.id, 'PAYROLL_DELETED', 'payroll', payrollId, null);
    revalidatePath('/app/payroll');
    return { ok: true };
  }

  init();
  const payroll = get('SELECT status FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId) as
    | { status: string }
    | undefined;
  if (!payroll) return { ok: false, error: 'Payroll not found.' };
  if (payroll.status !== 'draft') {
    return { ok: false, error: 'Only draft payrolls can be deleted. Cancel others first.' };
  }
  run('DELETE FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId);
  recordAudit(user.id, 'PAYROLL_DELETED', 'payroll', payrollId, null);
  revalidatePath('/app/payroll');
  return { ok: true };
}

export async function cancelPayrollAction(payrollId: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: payroll } = await supabase
      .from('payroll')
      .select('status')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (!payroll) return { ok: false, error: 'Payroll not found.' };
    if (payroll.status === 'finalized') {
      return { ok: false, error: 'Finalized payrolls must be reversed, not cancelled.' };
    }
    await supabase.from('payroll').update({ status: 'cancelled' }).eq('id', payrollId);
    recordAudit(user.id, 'PAYROLL_CANCELLED', 'payroll', payrollId, null);
    revalidatePath('/app/payroll');
    revalidatePath(`/app/payroll/${payrollId}`);
    return { ok: true };
  }

  init();
  const payroll = get('SELECT status FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId) as
    | { status: string }
    | undefined;
  if (!payroll) return { ok: false, error: 'Payroll not found.' };
  if (payroll.status === 'finalized') {
    return { ok: false, error: 'Finalized payrolls must be reversed, not cancelled.' };
  }
  run("UPDATE payroll SET status = 'cancelled' WHERE id = ? AND organization_id = ?", payrollId, orgId);
  recordAudit(user.id, 'PAYROLL_CANCELLED', 'payroll', payrollId, null);
  revalidatePath('/app/payroll');
  revalidatePath(`/app/payroll/${payrollId}`);
  return { ok: true };
}

export async function reversePayrollAction(payrollId: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: payroll } = await supabase
      .from('payroll')
      .select('*')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (!payroll) return { ok: false, error: 'Payroll not found.' };
    if (String(payroll.status) !== 'finalized') {
      return { ok: false, error: 'Only finalized payrolls can be reversed.' };
    }
    await supabase.from('payroll').update({ status: 'cancelled' }).eq('id', payrollId);
    recordAudit(user.id, 'PAYROLL_REVERSED', 'payroll', payrollId, {
      original_total_gross: Number(payroll.total_gross),
    });
    revalidatePath('/app/payroll');
    revalidatePath(`/app/payroll/${payrollId}`);
    revalidatePath('/app/history');
    return { ok: true };
  }

  init();
  const payroll = get('SELECT * FROM payroll WHERE id = ? AND organization_id = ?', payrollId, orgId) as
    | Record<string, unknown>
    | undefined;
  if (!payroll) return { ok: false, error: 'Payroll not found.' };
  if (String(payroll.status) !== 'finalized') {
    return { ok: false, error: 'Only finalized payrolls can be reversed.' };
  }
  run("UPDATE payroll SET status = 'cancelled' WHERE id = ? AND organization_id = ?", payrollId, orgId);
  recordAudit(user.id, 'PAYROLL_REVERSED', 'payroll', payrollId, {
    original_total_gross: Number(payroll.total_gross),
  });
  revalidatePath('/app/payroll');
  revalidatePath(`/app/payroll/${payrollId}`);
  revalidatePath('/app/history');
  return { ok: true };
}

export async function exportBankAdviceCsvAction(payrollId: number): Promise<{
  ok: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  let payroll: any;
  let items: any[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: p } = await supabase
      .from('payroll')
      .select('*, businesses(name)')
      .eq('id', payrollId)
      .eq('organization_id', orgId)
      .single();

    if (!p) return { ok: false, error: 'Payroll run not found.' };
    payroll = { ...p, business_name: (p.businesses as any)?.name };

    const { data: pi } = await supabase
      .from('payroll_items')
      .select('*, employees(employee_id, first_name, last_name, position)')
      .eq('payroll_id', payrollId);

    items = (pi || []).map((item: any) => ({
      ...item,
      emp_code: item.employees?.employee_id,
      first_name: item.employees?.first_name,
      last_name: item.employees?.last_name,
      position: item.employees?.position,
    }));
  } else {
    init();
    payroll = get(
      `SELECT p.*, b.name AS business_name FROM payroll p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.id = ? AND p.organization_id = ?`,
      payrollId,
      orgId
    );

    if (!payroll) return { ok: false, error: 'Payroll run not found.' };

    items = all(
      `SELECT pi.*, e.employee_id AS emp_code, e.first_name, e.last_name, e.position
       FROM payroll_items pi
       JOIN employees e ON e.id = pi.employee_id
       WHERE pi.payroll_id = ?
       ORDER BY e.last_name`,
      payrollId
    );
  }

  if (items.length === 0) {
    return { ok: false, error: 'No employee payroll items to export.' };
  }

  const businessName = String(payroll.business_name || 'Business').replace(/[^a-zA-Z0-9]/g, '_');
  const periodEnd = String(payroll.payroll_period_end || 'Period');
  const filename = `PESONet_Advice_${businessName}_${periodEnd}.csv`;

  const headers = [
    'Batch Reference',
    'Employee Code',
    'Employee Name',
    'Position',
    'Disbursal Channel',
    'Net Pay Amount',
    'Currency',
    'Value Date',
    'Status',
  ];

  const batchRef = `BATCH-PH-${payrollId}-${periodEnd.replace(/-/g, '')}`;

  const rows = items.map((item) => {
    const fullName = `"${String(item.last_name)}, ${String(item.first_name)}"`;
    const net = Number(item.net_pay || 0).toFixed(2);
    return [
      batchRef,
      String(item.emp_code || ''),
      fullName,
      `"${String(item.position || 'Employee')}"`,
      'PESONet / Corporate Direct Credit',
      net,
      'PHP',
      String(payroll.pay_date || periodEnd),
      'READY_FOR_CLEARING',
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\r\n');
  return { ok: true, csv, filename };
}
