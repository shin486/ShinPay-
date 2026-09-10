'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../auth';
import { recordAudit } from '../audit';
import { get, run, transaction } from '../db';
import { init } from '../init';
import { SAMPLE_BUSINESSES, SAMPLE_EMPLOYEES } from '../seed-data';
import { createClient, isSupabaseConfigured } from '../supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Explicitly loads sample 5-business / 17-employee setup for demo.
 * SKIPS any business code or employee ID that already exists.
 */
export async function seedSampleDataAction(): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization found.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const businessIds = new Map<string, number>();

    for (const b of SAMPLE_BUSINESSES) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('code', b.code)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (existing) {
        businessIds.set(b.code, Number(existing.id));
        continue;
      }

      const { data: newB } = await supabase
        .from('businesses')
        .insert({
          organization_id: orgId,
          name: b.name,
          code: b.code,
          description: b.description,
        })
        .select('id')
        .single();

      if (newB) {
        businessIds.set(b.code, Number(newB.id));
      }
    }

    for (const emp of SAMPLE_EMPLOYEES) {
      const businessId = businessIds.get(emp.business_code);
      if (!businessId) continue;

      const { data: existingEmp } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', emp.employee_id)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (existingEmp) continue;

      const { data: newEmp } = await supabase
        .from('employees')
        .insert({
          organization_id: orgId,
          business_id: businessId,
          employee_id: emp.employee_id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          position: emp.position,
          employment_status: emp.employment_status,
        })
        .select('id')
        .single();

      if (newEmp) {
        await supabase.from('employee_salary').insert({
          organization_id: orgId,
          employee_id: Number(newEmp.id),
          salary_type: emp.salary_type,
          basic_rate: emp.basic_rate,
          payroll_frequency: emp.payroll_frequency,
        });
      }
    }

    recordAudit(user.id, 'SAMPLE_DATA_LOADED', 'seed', null, {
      businesses: SAMPLE_BUSINESSES.length,
      employees: SAMPLE_EMPLOYEES.length,
    });
    revalidatePath('/');
    revalidatePath('/app/businesses');
    revalidatePath('/app/employees');
    return { ok: true };
  }

  // SQLite fallback
  init();
  const businessIds = new Map<string, number>();
  transaction(() => {
    for (const b of SAMPLE_BUSINESSES) {
      const existing = get('SELECT id FROM businesses WHERE code = ? AND organization_id = ?', b.code, orgId);
      if (existing) {
        businessIds.set(b.code, Number(existing.id));
        continue;
      }
      const res = run(
        'INSERT INTO businesses (name, code, description, organization_id) VALUES (?, ?, ?, ?)',
        b.name,
        b.code,
        b.description,
        orgId
      );
      businessIds.set(b.code, res.lastInsertRowid);
    }

    for (const emp of SAMPLE_EMPLOYEES) {
      const businessId = businessIds.get(emp.business_code);
      if (!businessId) continue;
      const empId = get('SELECT id FROM employees WHERE employee_id = ? AND organization_id = ?', emp.employee_id, orgId);
      if (empId) continue;
      const res = run(
        `INSERT INTO employees (employee_id, business_id, organization_id, first_name, last_name,
           position, employment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        emp.employee_id,
        businessId,
        orgId,
        emp.first_name,
        emp.last_name,
        emp.position,
        emp.employment_status
      );
      const employeeDbId = res.lastInsertRowid;
      run(
        `INSERT INTO employee_salary (employee_id, organization_id, salary_type, basic_rate, payroll_frequency)
         VALUES (?, ?, ?, ?, ?)`,
        employeeDbId,
        orgId,
        emp.salary_type,
        emp.basic_rate,
        emp.payroll_frequency
      );
    }
  });

  recordAudit(user.id, 'SAMPLE_DATA_LOADED', 'seed', null, {
    businesses: SAMPLE_BUSINESSES.length,
    employees: SAMPLE_EMPLOYEES.length,
  });
  revalidatePath('/');
  revalidatePath('/app/businesses');
  revalidatePath('/app/employees');
  return { ok: true };
}