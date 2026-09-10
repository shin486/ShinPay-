'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../auth';
import { recordAudit } from '../audit';
import { get, run, transaction } from '../db';
import { firstError, positiveNumber, required } from '../validators';
import { init } from '../init';
import { createClient, isSupabaseConfigured } from '../supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: number;
}

export interface EmployeeInput {
  employee_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  business_id: string | number;
  position?: string;
  employment_status: string;
  date_hired?: string;
  salary_type: string;
  basic_rate: string | number;
  payroll_frequency: string;
  effective_date?: string;
}

/** Create employee, including their initial salary record. */
export async function createEmployeeAction(input: EmployeeInput): Promise<ActionResult> {
  const user = await requireUser();
  const err = firstError([
    required(input.employee_id, 'Employee ID'),
    required(input.first_name, 'First name'),
    required(input.last_name, 'Last name'),
    required(input.business_id, 'Business'),
    required(input.salary_type, 'Salary type'),
    positiveNumber(input.basic_rate, 'Basic salary / rate'),
    required(input.payroll_frequency, 'Payroll frequency'),
  ]);
  if (err) return { ok: false, error: err };

  const employeeId = input.employee_id.trim();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  const businessId = Number(input.business_id);
  const basicRate = Number(input.basic_rate);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: dup } = await supabase
      .from('employees')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (dup) return { ok: false, error: 'This Employee ID already exists.' };

    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .insert({
        organization_id: orgId,
        business_id: businessId,
        employee_id: employeeId,
        first_name: input.first_name.trim(),
        middle_name: input.middle_name?.trim() || null,
        last_name: input.last_name.trim(),
        suffix: input.suffix?.trim() || null,
        date_of_birth: input.date_of_birth || null,
        contact_number: input.contact_number?.trim() || null,
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
        position: input.position?.trim() || null,
        employment_status: input.employment_status || 'Regular',
        date_hired: input.date_hired || null,
      })
      .select('id')
      .single();

    if (empErr || !emp) {
      return { ok: false, error: empErr?.message || 'Failed to create employee.' };
    }

    const createdId = Number(emp.id);

    await supabase.from('employee_salary').insert({
      organization_id: orgId,
      employee_id: createdId,
      salary_type: input.salary_type,
      basic_rate: basicRate,
      payroll_frequency: input.payroll_frequency,
      effective_date: input.effective_date || null,
    });

    recordAudit(user.id, 'EMPLOYEE_CREATED', 'employee', createdId, {
      employee_id: employeeId,
      business_id: businessId,
    });
    revalidatePath('/app/employees');
    revalidatePath('/');
    return { ok: true, id: createdId };
  }

  // SQLite fallback
  init();
  const dup = get('SELECT id FROM employees WHERE employee_id = ? AND organization_id = ?', employeeId, orgId);
  if (dup) return { ok: false, error: 'This Employee ID already exists.' };

  let createdId = 0;
  transaction(() => {
    const res = run(
      "INSERT INTO employees (organization_id, employee_id, business_id, first_name, middle_name, last_name, suffix, date_of_birth, contact_number, email, address, position, employment_status, date_hired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      orgId,
      employeeId,
      businessId,
      input.first_name.trim(),
      input.middle_name?.trim() || null,
      input.last_name.trim(),
      input.suffix?.trim() || null,
      input.date_of_birth || null,
      input.contact_number?.trim() || null,
      input.email?.trim() || null,
      input.address?.trim() || null,
      input.position?.trim() || null,
      input.employment_status || 'Regular',
      input.date_hired || null
    );
    createdId = res.lastInsertRowid;
    run(
      "INSERT INTO employee_salary (organization_id, employee_id, salary_type, basic_rate, payroll_frequency, effective_date) VALUES (?, ?, ?, ?, ?, ?)",
      orgId,
      createdId,
      input.salary_type,
      basicRate,
      input.payroll_frequency,
      input.effective_date || null
    );
  });

  recordAudit(user.id, 'EMPLOYEE_CREATED', 'employee', createdId, {
    employee_id: employeeId,
    business_id: businessId,
  });
  revalidatePath('/app/employees');
  revalidatePath('/');
  return { ok: true, id: createdId };
}

export async function updateEmployeeAction(id: number, input: EmployeeInput): Promise<ActionResult> {
  const user = await requireUser();
  const err = firstError([
    required(input.first_name, 'First name'),
    required(input.last_name, 'Last name'),
    required(input.business_id, 'Business'),
    required(input.employee_id, 'Employee ID'),
  ]);
  if (err) return { ok: false, error: err };

  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: dup } = await supabase
      .from('employees')
      .select('id')
      .eq('employee_id', input.employee_id.trim())
      .eq('organization_id', orgId)
      .neq('id', id)
      .maybeSingle();

    if (dup) return { ok: false, error: 'This Employee ID already exists.' };

    await supabase
      .from('employees')
      .update({
        employee_id: input.employee_id.trim(),
        business_id: Number(input.business_id),
        first_name: input.first_name.trim(),
        middle_name: input.middle_name?.trim() || null,
        last_name: input.last_name.trim(),
        suffix: input.suffix?.trim() || null,
        date_of_birth: input.date_of_birth || null,
        contact_number: input.contact_number?.trim() || null,
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
        position: input.position?.trim() || null,
        employment_status: input.employment_status || 'Regular',
        date_hired: input.date_hired || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', orgId);

    recordAudit(user.id, 'EMPLOYEE_UPDATED', 'employee', id, { employee_id: input.employee_id.trim() });
    revalidatePath('/app/employees');
    revalidatePath('/app/employees/' + id);
    return { ok: true, id };
  }

  init();
  const dup = get('SELECT id FROM employees WHERE employee_id = ? AND organization_id = ? AND id <> ?', input.employee_id.trim(), orgId, id);
  if (dup) return { ok: false, error: 'This Employee ID already exists.' };

  run(
    "UPDATE employees SET employee_id = ?, business_id = ?, first_name = ?, middle_name = ?, last_name = ?, suffix = ?, date_of_birth = ?, contact_number = ?, email = ?, address = ?, position = ?, employment_status = ?, date_hired = ?, updated_at = datetime('now') WHERE id = ? AND organization_id = ?",
    input.employee_id.trim(),
    Number(input.business_id),
    input.first_name.trim(),
    input.middle_name?.trim() || null,
    input.last_name.trim(),
    input.suffix?.trim() || null,
    input.date_of_birth || null,
    input.contact_number?.trim() || null,
    input.email?.trim() || null,
    input.address?.trim() || null,
    input.position?.trim() || null,
    input.employment_status || 'Regular',
    input.date_hired || null,
    id,
    orgId
  );
  recordAudit(user.id, 'EMPLOYEE_UPDATED', 'employee', id, { employee_id: input.employee_id.trim() });
  revalidatePath('/app/employees');
  revalidatePath('/app/employees/' + id);
  return { ok: true, id };
}

export async function setSalaryAction(employeeId: number, input: { salary_type: string; basic_rate: string | number; payroll_frequency: string; effective_date?: string; }): Promise<ActionResult> {
  const user = await requireUser();
  const err = firstError([
    required(input.salary_type, 'Salary type'),
    positiveNumber(input.basic_rate, 'Basic salary / rate'),
    required(input.payroll_frequency, 'Payroll frequency'),
  ]);
  if (err) return { ok: false, error: err };

  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from('employee_salary').insert({
      organization_id: orgId,
      employee_id: employeeId,
      salary_type: input.salary_type,
      basic_rate: Number(input.basic_rate),
      payroll_frequency: input.payroll_frequency,
      effective_date: input.effective_date || null,
    });
    recordAudit(user.id, 'SALARY_SET', 'employee', employeeId, { salary_type: input.salary_type, basic_rate: Number(input.basic_rate), payroll_frequency: input.payroll_frequency });
    revalidatePath('/app/employees/' + employeeId);
    revalidatePath('/app/employees');
    return { ok: true };
  }

  init();
  run(
    "INSERT INTO employee_salary (organization_id, employee_id, salary_type, basic_rate, payroll_frequency, effective_date) VALUES (?, ?, ?, ?, ?, ?)",
    orgId,
    employeeId,
    input.salary_type,
    Number(input.basic_rate),
    input.payroll_frequency,
    input.effective_date || null
  );
  recordAudit(user.id, 'SALARY_SET', 'employee', employeeId, { salary_type: input.salary_type, basic_rate: Number(input.basic_rate), payroll_frequency: input.payroll_frequency });
  revalidatePath('/app/employees/' + employeeId);
  revalidatePath('/app/employees');
  return { ok: true };
}

export async function deactivateEmployeeAction(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('employees')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', orgId);
    recordAudit(user.id, 'EMPLOYEE_DEACTIVATED', 'employee', id, null);
    revalidatePath('/app/employees');
    return { ok: true };
  }

  init();
  run("UPDATE employees SET status = 'inactive', updated_at = datetime('now') WHERE id = ? AND organization_id = ?", id, orgId);
  recordAudit(user.id, 'EMPLOYEE_DEACTIVATED', 'employee', id, null);
  revalidatePath('/app/employees');
  return { ok: true };
}

export async function reactivateEmployeeAction(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('employees')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', orgId);
    recordAudit(user.id, 'EMPLOYEE_REACTIVATED', 'employee', id, null);
    revalidatePath('/app/employees');
    return { ok: true };
  }

  init();
  run("UPDATE employees SET status = 'active', updated_at = datetime('now') WHERE id = ? AND organization_id = ?", id, orgId);
  recordAudit(user.id, 'EMPLOYEE_REACTIVATED', 'employee', id, null);
  revalidatePath('/app/employees');
  return { ok: true };
}

export async function deleteEmployeeAction(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { count } = await supabase
      .from('payroll_items')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', id);

    if (count && count > 0) {
      return { ok: false, error: 'This employee has payroll history and cannot be deleted. You can deactivate them instead.' };
    }

    await supabase.from('employees').delete().eq('id', id).eq('organization_id', orgId);
    recordAudit(user.id, 'EMPLOYEE_DELETED', 'employee', id, null);
    revalidatePath('/app/employees');
    return { ok: true };
  }

  init();
  const used = get('SELECT COUNT(*) AS c FROM payroll_items WHERE employee_id = ?', id) as { c: number };
  if (Number(used.c) > 0) {
    return { ok: false, error: 'This employee has payroll history and cannot be deleted. You can deactivate them instead.' };
  }
  transaction(() => {
    run('DELETE FROM employee_salary WHERE employee_id = ?', id);
    run('DELETE FROM employee_earnings WHERE employee_id = ?', id);
    run('DELETE FROM employee_deductions WHERE employee_id = ?', id);
    run('DELETE FROM employees WHERE id = ? AND organization_id = ?', id, orgId);
  });
  recordAudit(user.id, 'EMPLOYEE_DELETED', 'employee', id, null);
  revalidatePath('/app/employees');
  return { ok: true };
}

export interface EarningInput {
  earning_type_id: string | number;
  amount: string | number;
  calculation_type: string;
  frequency: string;
  effective_date?: string;
  one_time?: boolean | string | number;
}

export async function addEarningAction(employeeId: number, input: EarningInput): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  const err = firstError([required(input.earning_type_id, 'Earning type'), positiveNumber(input.amount, 'Amount', true)]);
  if (err) return { ok: false, error: err };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: res, error } = await supabase
      .from('employee_earnings')
      .insert({
        organization_id: orgId,
        employee_id: employeeId,
        earning_type_id: Number(input.earning_type_id),
        amount: Number(input.amount),
        calculation_type: input.calculation_type || 'fixed',
        frequency: input.frequency || 'monthly',
        effective_date: input.effective_date || null,
        one_time: input.one_time ? 1 : 0,
      })
      .select('id')
      .single();

    if (error || !res) return { ok: false, error: error?.message || 'Failed to add earning.' };

    recordAudit(user.id, 'EARNING_ADDED', 'employee', employeeId, { earning_type_id: Number(input.earning_type_id), amount: Number(input.amount) });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true, id: Number(res.id) };
  }

  init();
  const res = run(
    "INSERT INTO employee_earnings (organization_id, employee_id, earning_type_id, amount, calculation_type, frequency, effective_date, one_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    orgId,
    employeeId,
    Number(input.earning_type_id),
    Number(input.amount),
    input.calculation_type || 'fixed',
    input.frequency || 'monthly',
    input.effective_date || null,
    input.one_time ? 1 : 0
  );
  recordAudit(user.id, 'EARNING_ADDED', 'employee', employeeId, { earning_type_id: Number(input.earning_type_id), amount: Number(input.amount) });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true, id: res.lastInsertRowid };
}

export async function updateEarningAction(id: number, employeeId: number, input: EarningInput): Promise<ActionResult> {
  const user = await requireUser();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('employee_earnings')
      .update({
        earning_type_id: Number(input.earning_type_id),
        amount: Number(input.amount),
        calculation_type: input.calculation_type || 'fixed',
        frequency: input.frequency || 'monthly',
        effective_date: input.effective_date || null,
        one_time: input.one_time ? 1 : 0,
      })
      .eq('id', id)
      .eq('employee_id', employeeId);

    recordAudit(user.id, 'EARNING_UPDATED', 'employee', employeeId, { earning_id: id });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true };
  }

  init();
  run(
    "UPDATE employee_earnings SET earning_type_id = ?, amount = ?, calculation_type = ?, frequency = ?, effective_date = ?, one_time = ? WHERE id = ? AND employee_id = ?",
    Number(input.earning_type_id),
    Number(input.amount),
    input.calculation_type || 'fixed',
    input.frequency || 'monthly',
    input.effective_date || null,
    input.one_time ? 1 : 0,
    id,
    employeeId
  );
  recordAudit(user.id, 'EARNING_UPDATED', 'employee', employeeId, { earning_id: id });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true };
}

export async function deleteEarningAction(id: number, employeeId: number): Promise<ActionResult> {
  const user = await requireUser();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from('employee_earnings').delete().eq('id', id).eq('employee_id', employeeId);
    recordAudit(user.id, 'EARNING_DELETED', 'employee', employeeId, { earning_id: id });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true };
  }

  init();
  run('DELETE FROM employee_earnings WHERE id = ? AND employee_id = ?', id, employeeId);
  recordAudit(user.id, 'EARNING_DELETED', 'employee', employeeId, { earning_id: id });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true };
}

export async function toggleEarningStatusAction(id: number, employeeId: number, status: string): Promise<ActionResult> {
  const user = await requireUser();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('employee_earnings')
      .update({ status })
      .eq('id', id)
      .eq('employee_id', employeeId);
    recordAudit(user.id, 'EARNING_STATUS', 'employee', employeeId, { earning_id: id, status });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true };
  }

  init();
  run('UPDATE employee_earnings SET status = ? WHERE id = ? AND employee_id = ?', status, id, employeeId);
  recordAudit(user.id, 'EARNING_STATUS', 'employee', employeeId, { earning_id: id, status });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true };
}

export interface DeductionInput {
  deduction_type_id: string | number;
  amount: string | number;
  calculation_type: string;
  frequency: string;
  effective_date?: string;
  end_date?: string;
}

export async function addDeductionAction(employeeId: number, input: DeductionInput): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  const err = firstError([required(input.deduction_type_id, 'Deduction type'), positiveNumber(input.amount, 'Amount', true)]);
  if (err) return { ok: false, error: err };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: res, error } = await supabase
      .from('employee_deductions')
      .insert({
        organization_id: orgId,
        employee_id: employeeId,
        deduction_type_id: Number(input.deduction_type_id),
        amount: Number(input.amount),
        calculation_type: input.calculation_type || 'fixed',
        frequency: input.frequency || 'monthly',
        effective_date: input.effective_date || null,
        end_date: input.end_date || null,
      })
      .select('id')
      .single();

    if (error || !res) return { ok: false, error: error?.message || 'Failed to add deduction.' };

    recordAudit(user.id, 'DEDUCTION_ADDED', 'employee', employeeId, { deduction_type_id: Number(input.deduction_type_id), amount: Number(input.amount) });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true, id: Number(res.id) };
  }

  init();
  const res = run(
    "INSERT INTO employee_deductions (organization_id, employee_id, deduction_type_id, amount, calculation_type, frequency, effective_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    orgId,
    employeeId,
    Number(input.deduction_type_id),
    Number(input.amount),
    input.calculation_type || 'fixed',
    input.frequency || 'monthly',
    input.effective_date || null,
    input.end_date || null
  );
  recordAudit(user.id, 'DEDUCTION_ADDED', 'employee', employeeId, { deduction_type_id: Number(input.deduction_type_id), amount: Number(input.amount) });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true, id: res.lastInsertRowid };
}

export async function updateDeductionAction(id: number, employeeId: number, input: DeductionInput): Promise<ActionResult> {
  const user = await requireUser();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('employee_deductions')
      .update({
        deduction_type_id: Number(input.deduction_type_id),
        amount: Number(input.amount),
        calculation_type: input.calculation_type || 'fixed',
        frequency: input.frequency || 'monthly',
        effective_date: input.effective_date || null,
        end_date: input.end_date || null,
      })
      .eq('id', id)
      .eq('employee_id', employeeId);

    recordAudit(user.id, 'DEDUCTION_UPDATED', 'employee', employeeId, { deduction_id: id });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true };
  }

  init();
  run(
    "UPDATE employee_deductions SET deduction_type_id = ?, amount = ?, calculation_type = ?, frequency = ?, effective_date = ?, end_date = ? WHERE id = ? AND employee_id = ?",
    Number(input.deduction_type_id),
    Number(input.amount),
    input.calculation_type || 'fixed',
    input.frequency || 'monthly',
    input.effective_date || null,
    input.end_date || null,
    id,
    employeeId
  );
  recordAudit(user.id, 'DEDUCTION_UPDATED', 'employee', employeeId, { deduction_id: id });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true };
}

export async function deleteDeductionAction(id: number, employeeId: number): Promise<ActionResult> {
  const user = await requireUser();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from('employee_deductions').delete().eq('id', id).eq('employee_id', employeeId);
    recordAudit(user.id, 'DEDUCTION_DELETED', 'employee', employeeId, { deduction_id: id });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true };
  }

  init();
  run('DELETE FROM employee_deductions WHERE id = ? AND employee_id = ?', id, employeeId);
  recordAudit(user.id, 'DEDUCTION_DELETED', 'employee', employeeId, { deduction_id: id });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true };
}

export async function toggleDeductionStatusAction(id: number, employeeId: number, status: string): Promise<ActionResult> {
  const user = await requireUser();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('employee_deductions')
      .update({ status })
      .eq('id', id)
      .eq('employee_id', employeeId);
    recordAudit(user.id, 'DEDUCTION_STATUS', 'employee', employeeId, { deduction_id: id, status });
    revalidatePath('/app/employees/' + employeeId);
    return { ok: true };
  }

  init();
  run('UPDATE employee_deductions SET status = ? WHERE id = ? AND employee_id = ?', status, id, employeeId);
  recordAudit(user.id, 'DEDUCTION_STATUS', 'employee', employeeId, { deduction_id: id, status });
  revalidatePath('/app/employees/' + employeeId);
  return { ok: true };
}

export async function addEarningTypeAction(input: { name: string; description?: string; calculation_type: string; }): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  const err = required(input.name, 'Earning type name');
  if (err) return { ok: false, error: err };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: res, error } = await supabase
      .from('earning_types')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        calculation_type: input.calculation_type || 'fixed',
      })
      .select('id')
      .single();

    if (error || !res) return { ok: false, error: 'An earning type with that name already exists.' };
    recordAudit(user.id, 'EARNING_TYPE_ADDED', 'earning_type', Number(res.id), { name: input.name.trim() });
    revalidatePath('/app/settings');
    return { ok: true, id: Number(res.id) };
  }

  init();
  try {
    const res = run('INSERT INTO earning_types (organization_id, name, description, calculation_type) VALUES (?, ?, ?, ?)', orgId, input.name.trim(), input.description?.trim() || null, input.calculation_type || 'fixed');
    recordAudit(user.id, 'EARNING_TYPE_ADDED', 'earning_type', res.lastInsertRowid, { name: input.name.trim() });
    revalidatePath('/app/settings');
    return { ok: true, id: res.lastInsertRowid };
  } catch {
    return { ok: false, error: 'An earning type with that name already exists.' };
  }
}

export async function addDeductionTypeAction(input: { name: string; description?: string; calculation_type: string; }): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  const err = required(input.name, 'Deduction type name');
  if (err) return { ok: false, error: err };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: res, error } = await supabase
      .from('deduction_types')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        calculation_type: input.calculation_type || 'fixed',
      })
      .select('id')
      .single();

    if (error || !res) return { ok: false, error: 'A deduction type with that name already exists.' };
    recordAudit(user.id, 'DEDUCTION_TYPE_ADDED', 'deduction_type', Number(res.id), { name: input.name.trim() });
    revalidatePath('/app/settings');
    return { ok: true, id: Number(res.id) };
  }

  init();
  try {
    const res = run('INSERT INTO deduction_types (organization_id, name, description, calculation_type) VALUES (?, ?, ?, ?)', orgId, input.name.trim(), input.description?.trim() || null, input.calculation_type || 'fixed');
    recordAudit(user.id, 'DEDUCTION_TYPE_ADDED', 'deduction_type', res.lastInsertRowid, { name: input.name.trim() });
    revalidatePath('/app/settings');
    return { ok: true, id: res.lastInsertRowid };
  } catch {
    return { ok: false, error: 'A deduction type with that name already exists.' };
  }
}
