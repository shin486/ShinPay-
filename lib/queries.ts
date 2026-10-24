import { all, get, idNameOptions, type IdNameOption } from './db';
import { createClient, isSupabaseConfigured } from './supabase/server';

export interface BusinessItem {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  contact_information?: string | null;
  status: string;
  created_at?: string;
  employee_count?: number;
}

export interface EmployeeListItem {
  id: number;
  employee_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  position?: string | null;
  status: string;
  business_id: number;
  business_name: string;
  basic_rate?: number | null;
  salary_type?: string | null;
}

/** Get dropdown options of active businesses for an organization. */
export async function getBusinessOptions(orgId: number | null | undefined): Promise<IdNameOption[]> {
  if (!orgId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('name');
      return (data || []).map((b) => ({ id: Number(b.id), name: String(b.name) }));
    } catch {
      return [];
    }
  }

  try {
    return idNameOptions(
      "SELECT id, name FROM businesses WHERE organization_id = ? AND status = 'active' ORDER BY name",
      orgId
    );
  } catch {
    return [];
  }
}

/** Get all businesses with employee count for an organization. */
export async function getBusinesses(orgId: number | null | undefined): Promise<BusinessItem[]> {
  if (!orgId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: bData } = await supabase
        .from('businesses')
        .select('id, name, code, address, contact_information, status, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      const { data: empCounts } = await supabase
        .from('employees')
        .select('business_id')
        .eq('organization_id', orgId)
        .eq('status', 'active');

      const countMap = new Map<number, number>();
      for (const e of empCounts || []) {
        const bid = Number(e.business_id);
        countMap.set(bid, (countMap.get(bid) || 0) + 1);
      }

      return (bData || []).map((b) => ({
        id: Number(b.id),
        name: String(b.name),
        code: String(b.code),
        address: b.address,
        contact_information: b.contact_information,
        status: String(b.status),
        created_at: b.created_at,
        employee_count: countMap.get(Number(b.id)) || 0,
      }));
    } catch (e) {
      console.error('Error fetching businesses from Supabase:', e);
      return [];
    }
  }

  try {
    const rows = all(
      `SELECT id, name, code, address, contact_information, status, created_at,
              (SELECT COUNT(*) FROM employees WHERE business_id = businesses.id) AS employee_count
       FROM businesses WHERE organization_id = ?`,
      orgId
    );
    return rows.map((b: any) => ({
      id: Number(b.id),
      name: String(b.name),
      code: String(b.code),
      address: b.address,
      contact_information: b.contact_information,
      status: String(b.status),
      created_at: b.created_at,
      employee_count: Number(b.employee_count || 0),
    }));
  } catch {
    return [];
  }
}

/** Get a single business row by ID and orgId. */
export async function getBusiness(id: number, orgId: number | null | undefined): Promise<any | null> {
  if (!orgId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      return data;
    } catch {
      return null;
    }
  }

  try {
    return get('SELECT * FROM businesses WHERE id = ? AND organization_id = ?', id, orgId);
  } catch {
    return null;
  }
}

/** Get a single business by ID and its employees. */
export async function getBusinessDetail(id: number, orgId: number | null | undefined) {
  if (!orgId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: b } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (!b) return null;

      const { data: emps } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name, position, status, date_hired')
        .eq('business_id', id)
        .order('last_name');

      return {
        business: b,
        employees: emps || [],
      };
    } catch {
      return null;
    }
  }

  try {
    const b = get('SELECT * FROM businesses WHERE id = ? AND organization_id = ?', id, orgId);
    if (!b) return null;
    const employees = all(
      `SELECT e.id, e.employee_id, e.first_name, e.last_name, e.position, e.status, e.date_hired
       FROM employees e WHERE e.business_id = ? ORDER BY e.last_name`,
      id
    );
    return { business: b, employees };
  } catch {
    return null;
  }
}

/** Get all employees for an organization with compensation and branch name. */
export async function getEmployees(orgId: number | null | undefined): Promise<EmployeeListItem[]> {
  if (!orgId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: emps } = await supabase
        .from('employees')
        .select(`
          id, employee_id, first_name, middle_name, last_name, suffix,
          position, status, business_id,
          businesses ( name ),
          employee_salary ( basic_rate, salary_type )
        `)
        .eq('organization_id', orgId)
        .order('last_name');

      return (emps || []).map((e: any) => {
        const sal = Array.isArray(e.employee_salary) ? e.employee_salary[0] : e.employee_salary;
        return {
          id: Number(e.id),
          employee_id: String(e.employee_id),
          first_name: String(e.first_name),
          middle_name: e.middle_name,
          last_name: String(e.last_name),
          suffix: e.suffix,
          position: e.position,
          status: String(e.status),
          business_id: Number(e.business_id),
          business_name: e.businesses?.name || '—',
          basic_rate: sal?.basic_rate ?? null,
          salary_type: sal?.salary_type ?? null,
        };
      });
    } catch {
      return [];
    }
  }

  try {
    const rows = all(
      `SELECT e.id, e.employee_id, e.first_name, e.middle_name, e.last_name, e.suffix,
              e.position, e.status, b.name AS business_name, e.business_id,
              (SELECT es.basic_rate FROM employee_salary es WHERE es.employee_id = e.id ORDER BY COALESCE(es.effective_date, '0000-01-01') DESC, es.id DESC LIMIT 1) AS basic_rate,
              (SELECT es.salary_type FROM employee_salary es WHERE es.employee_id = e.id ORDER BY COALESCE(es.effective_date, '0000-01-01') DESC, es.id DESC LIMIT 1) AS salary_type
       FROM employees e JOIN businesses b ON b.id = e.business_id WHERE e.organization_id = ?`,
      orgId
    );
    return rows.map((e: any) => ({
      id: Number(e.id),
      employee_id: String(e.employee_id),
      first_name: String(e.first_name),
      middle_name: e.middle_name,
      last_name: String(e.last_name),
      suffix: e.suffix,
      position: e.position,
      status: String(e.status),
      business_id: Number(e.business_id),
      business_name: String(e.business_name || '—'),
      basic_rate: e.basic_rate != null ? Number(e.basic_rate) : null,
      salary_type: e.salary_type ? String(e.salary_type) : null,
    }));
  } catch {
    return [];
  }
}

/** Get a single employee row by ID and orgId. */
export async function getEmployee(id: number, orgId: number | null | undefined): Promise<any | null> {
  if (!orgId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      return data;
    } catch {
      return null;
    }
  }

  try {
    return get('SELECT * FROM employees WHERE id = ? AND organization_id = ?', id, orgId);
  } catch {
    return null;
  }
}

/** Get full employee detail for detail view. */
export async function getEmployeeDetail(id: number, orgId: number | null | undefined) {
  if (!orgId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: emp } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (!emp) return null;

      const { data: bus } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', Number(emp.business_id))
        .eq('organization_id', orgId)
        .maybeSingle();

      const { data: salRows } = await supabase
        .from('employee_salary')
        .select('*')
        .eq('employee_id', id)
        .order('id', { ascending: false });

      const salaryHistory = salRows || [];
      const salary = salaryHistory[0] || null;

      const { data: etData } = await supabase
        .from('earning_types')
        .select('id, name')
        .eq('status', 'active')
        .or(`organization_id.eq.${orgId},organization_id.is.null`)
        .order('name');
      const earningTypes: IdNameOption[] = (etData || []).map((t) => ({ id: Number(t.id), name: String(t.name) }));

      const { data: dtData } = await supabase
        .from('deduction_types')
        .select('id, name')
        .eq('status', 'active')
        .or(`organization_id.eq.${orgId},organization_id.is.null`)
        .order('name');
      const deductionTypes: IdNameOption[] = (dtData || []).map((t) => ({ id: Number(t.id), name: String(t.name) }));

      const { data: earnRows } = await supabase
        .from('employee_earnings')
        .select('id, amount, calculation_type, frequency, one_time, status, earning_types(name)')
        .eq('employee_id', id)
        .order('id', { ascending: false });

      const earnings = (earnRows || []).map((e: any) => ({
        id: Number(e.id),
        amount: Number(e.amount),
        calculation_type: String(e.calculation_type),
        frequency: String(e.frequency),
        one_time: Boolean(e.one_time),
        status: String(e.status),
        name: String(e.earning_types?.name || 'Earning'),
      }));

      const { data: dedRows } = await supabase
        .from('employee_deductions')
        .select('id, amount, calculation_type, frequency, status, deduction_types(name)')
        .eq('employee_id', id)
        .order('id', { ascending: false });

      const deductions = (dedRows || []).map((d: any) => ({
        id: Number(d.id),
        amount: Number(d.amount),
        calculation_type: String(d.calculation_type),
        frequency: String(d.frequency),
        status: String(d.status),
        name: String(d.deduction_types?.name || 'Deduction'),
      }));

      const { data: piRows } = await supabase
        .from('payroll_items')
        .select('id, gross_pay, total_deductions, net_pay, payroll(id, payroll_period_start, payroll_period_end, status, pay_date)')
        .eq('employee_id', id)
        .order('id', { ascending: false })
        .limit(10);

      const payrollHistory = (piRows || []).map((pi: any) => ({
        id: pi.payroll?.id,
        payroll_period_start: pi.payroll?.payroll_period_start,
        payroll_period_end: pi.payroll?.payroll_period_end,
        status: pi.payroll?.status,
        pay_date: pi.payroll?.pay_date,
        gross_pay: pi.gross_pay,
        total_deductions: pi.total_deductions,
        net_pay: pi.net_pay,
      }));

      return {
        emp,
        business: bus,
        salary,
        salaryHistory,
        earningTypes,
        deductionTypes,
        earnings,
        deductions,
        payrollHistory,
      };
    } catch (e) {
      console.error('Error fetching employee detail from Supabase:', e);
      return null;
    }
  }

  try {
    const emp = get('SELECT * FROM employees WHERE id = ? AND organization_id = ?', id, orgId) as Record<string, unknown> | undefined;
    if (!emp) return null;

    const business = get('SELECT name FROM businesses WHERE id = ? AND organization_id = ?', Number(emp.business_id), orgId) as { name: string } | undefined;
    const salary = get(
      "SELECT * FROM employee_salary WHERE employee_id = ? ORDER BY COALESCE(effective_date, '0000-01-01') DESC, id DESC LIMIT 1",
      id
    ) as Record<string, unknown> | undefined;

    const salaryHistory = all(
      "SELECT * FROM employee_salary WHERE employee_id = ? ORDER BY COALESCE(effective_date, '0000-01-01') DESC, id DESC",
      id
    );

    const earningTypes = all("SELECT id, name FROM earning_types WHERE organization_id = ? AND status = 'active' ORDER BY name", orgId) as unknown as IdNameOption[];
    const deductionTypes = all("SELECT id, name FROM deduction_types WHERE organization_id = ? AND status = 'active' ORDER BY name", orgId) as unknown as IdNameOption[];

    const earnings = all(
      `SELECT ee.id, ee.amount, ee.calculation_type, ee.frequency, ee.one_time, ee.status, et.name
       FROM employee_earnings ee JOIN earning_types et ON et.id = ee.earning_type_id
       WHERE ee.employee_id = ? ORDER BY ee.id DESC`,
      id
    );

    const deductions = all(
      `SELECT ed.id, ed.amount, ed.calculation_type, ed.frequency, ed.status, dt.name
       FROM employee_deductions ed JOIN deduction_types dt ON dt.id = ed.deduction_type_id
       WHERE ed.employee_id = ? ORDER BY ed.id DESC`,
      id
    );

    const payrollHistory = all(
      `SELECT p.id, p.payroll_period_start, p.payroll_period_end, p.status, p.pay_date,
              pi.gross_pay, pi.total_deductions, pi.net_pay
       FROM payroll_items pi JOIN payroll p ON p.id = pi.payroll_id
       WHERE pi.employee_id = ? ORDER BY p.payroll_period_end DESC LIMIT 10`,
      id
    );

    return {
      emp,
      business,
      salary,
      salaryHistory,
      earningTypes,
      deductionTypes,
      earnings,
      deductions,
      payrollHistory,
    };
  } catch {
    return null;
  }
}

/** Get payroll list for an organization. */
export async function getPayrolls(orgId: number | null | undefined): Promise<any[]> {
  if (!orgId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('payroll')
        .select('*, businesses(name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      return (data || []).map((p: any) => ({
        ...p,
        business_name: p.businesses?.name || 'Business',
      }));
    } catch {
      return [];
    }
  }

  try {
    return all(
      `SELECT p.*, b.name AS business_name FROM payroll p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.organization_id = ?
       ORDER BY p.created_at DESC`,
      orgId
    );
  } catch {
    return [];
  }
}

/** Get full payroll detail with calculation items. */
export async function getPayrollDetail(id: number, orgId: number | null | undefined) {
  if (!orgId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: p } = await supabase
        .from('payroll')
        .select('*, businesses(name)')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (!p) return null;

      const business = { name: p.businesses?.name || 'Business' };

      const { data: itemsRaw } = await supabase
        .from('payroll_items')
        .select('*, employees(employee_id, first_name, last_name, position)')
        .eq('payroll_id', id);

      const items = (itemsRaw || []).map((pi: any) => ({
        ...pi,
        emp_code: pi.employees?.employee_id || '',
        first_name: pi.employees?.first_name || '',
        last_name: pi.employees?.last_name || '',
        position: pi.employees?.position || '',
      })).sort((a, b) => a.last_name.localeCompare(b.last_name));

      // Statutory deduction breakdown
      const { data: dedRaw } = await supabase
        .from('payroll_item_deductions')
        .select('name, amount, payroll_items!inner(payroll_id)')
        .eq('payroll_items.payroll_id', id);

      const dedMap = new Map<string, number>();
      for (const d of dedRaw || []) {
        dedMap.set(d.name, (dedMap.get(d.name) || 0) + Number(d.amount));
      }
      const deductionBreakdown = Array.from(dedMap.entries()).map(([name, total]) => ({ name, total }));

      // Audit
      const { data: finalizationAudit } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity', 'payroll')
        .eq('entity_id', id)
        .eq('action', 'PAYROLL_FINALIZED')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        payroll: p,
        business,
        items,
        deductionBreakdown,
        finalizationAudit,
      };
    } catch (e) {
      console.error('Error fetching payroll detail from Supabase:', e);
      return null;
    }
  }

  try {
    const p = get(
      'SELECT * FROM payroll WHERE id = ? AND organization_id = ?',
      id,
      orgId
    ) as Record<string, unknown> | undefined;

    if (!p) return null;

    const business = get(
      'SELECT name FROM businesses WHERE id = ? AND organization_id = ?',
      Number(p.business_id),
      orgId
    ) as { name: string } | undefined;

    const items = all(
      `SELECT pi.*, e.employee_id AS emp_code, e.first_name, e.last_name, e.position
       FROM payroll_items pi
       JOIN employees e ON e.id = pi.employee_id
       WHERE pi.payroll_id = ?
       ORDER BY e.last_name`,
      id
    );

    const deductionBreakdown = all(
      `SELECT pid.name, SUM(pid.amount) AS total
       FROM payroll_item_deductions pid
       JOIN payroll_items pi ON pi.id = pid.payroll_item_id
       WHERE pi.payroll_id = ?
       GROUP BY pid.name
       ORDER BY total DESC`,
      id
    ) as Array<{ name: string; total: number }>;

    const finalizationAudit = get(
      `SELECT al.*, u.display_name AS actor_name
       FROM audit_log al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.entity = 'payroll' AND al.entity_id = ? AND al.action = 'PAYROLL_FINALIZED'
       ORDER BY al.id DESC LIMIT 1`,
      id
    ) as Record<string, unknown> | undefined;

    return {
      payroll: p,
      business,
      items,
      deductionBreakdown,
      finalizationAudit,
    };
  } catch {
    return null;
  }
}

/** Get finalized payroll runs for payslips. */
export async function getFinalizedPayrolls(orgId: number | null | undefined): Promise<any[]> {
  if (!orgId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('payroll')
        .select('*, businesses(name)')
        .eq('status', 'finalized')
        .eq('organization_id', orgId)
        .order('payroll_period_end', { ascending: false });

      return (data || []).map((p: any) => ({
        ...p,
        business_name: p.businesses?.name || 'Business',
      }));
    } catch {
      return [];
    }
  }

  try {
    return all(
      `SELECT p.*, b.name AS business_name FROM payroll p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.status = 'finalized' AND p.organization_id = ?
       ORDER BY p.payroll_period_end DESC`,
      orgId
    );
  } catch {
    return [];
  }
}

/** Get payslip items for a specific payroll run. */
export async function getPayslipItems(payrollId: number): Promise<any[]> {
  if (!payrollId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('payroll_items')
        .select('*, employees(employee_id, first_name, last_name, position)')
        .eq('payroll_id', payrollId);

      return (data || []).map((pi: any) => ({
        ...pi,
        emp_code: pi.employees?.employee_id || '',
        first_name: pi.employees?.first_name || '',
        last_name: pi.employees?.last_name || '',
        position: pi.employees?.position || '',
      })).sort((a, b) => a.last_name.localeCompare(b.last_name));
    } catch {
      return [];
    }
  }

  try {
    return all(
      `SELECT pi.*, e.employee_id AS emp_code, e.first_name, e.last_name, e.position
       FROM payroll_items pi
       JOIN employees e ON e.id = pi.employee_id
       WHERE pi.payroll_id = ?
       ORDER BY e.last_name`,
      payrollId
    );
  } catch {
    return [];
  }
}

/** Get single employee payslip detail for print view. */
export async function getPayslipDetail(itemId: number, orgId: number | null | undefined) {
  if (!orgId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: item } = await supabase
        .from('payroll_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      if (!item) return null;

      const { data: payroll } = await supabase
        .from('payroll')
        .select('*')
        .eq('id', Number(item.payroll_id))
        .eq('organization_id', orgId)
        .maybeSingle();

      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', Number(item.employee_id))
        .eq('organization_id', orgId)
        .maybeSingle();

      if (!payroll || !employee) return null;

      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', Number(payroll.business_id))
        .eq('organization_id', orgId)
        .maybeSingle();

      const { data: earnings } = await supabase
        .from('payroll_item_earnings')
        .select('name, amount')
        .eq('payroll_item_id', itemId)
        .order('id');

      const { data: deductions } = await supabase
        .from('payroll_item_deductions')
        .select('name, amount')
        .eq('payroll_item_id', itemId)
        .order('id');

      return {
        item,
        payroll,
        employee,
        business,
        earnings: earnings || [],
        deductions: deductions || [],
      };
    } catch (e) {
      console.error('Error fetching payslip detail from Supabase:', e);
      return null;
    }
  }

  try {
    const item = get('SELECT * FROM payroll_items WHERE id = ?', itemId) as Record<string, unknown> | undefined;
    if (!item) return null;

    const payroll = get('SELECT * FROM payroll WHERE id = ? AND organization_id = ?', Number(item.payroll_id), orgId) as Record<string, unknown> | undefined;
    const employee = get('SELECT * FROM employees WHERE id = ? AND organization_id = ?', Number(item.employee_id), orgId) as Record<string, unknown> | undefined;
    const business = payroll ? (get('SELECT name FROM businesses WHERE id = ? AND organization_id = ?', Number(payroll.business_id), orgId) as { name: string } | undefined) : undefined;

    if (!payroll || !employee) return null;

    const earnings = all(
      'SELECT name, amount FROM payroll_item_earnings WHERE payroll_item_id = ? ORDER BY id',
      itemId
    );
    const deductions = all(
      'SELECT name, amount FROM payroll_item_deductions WHERE payroll_item_id = ? ORDER BY id',
      itemId
    );

    return {
      item,
      payroll,
      employee,
      business,
      earnings,
      deductions,
    };
  } catch {
    return null;
  }
}

/** Get reference types, audit logs, and member users for settings. */
export async function getSettingsData(orgId: number | null | undefined) {
  if (!orgId) {
    return { earningTypes: [], deductionTypes: [], audit: [], users: [] };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: et } = await supabase
        .from('earning_types')
        .select('*')
        .or(`organization_id.eq.${orgId},organization_id.is.null`)
        .order('name');

      const { data: dt } = await supabase
        .from('deduction_types')
        .select('*')
        .or(`organization_id.eq.${orgId},organization_id.is.null`)
        .order('name');

      const { data: al } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: om } = await supabase
        .from('organization_members')
        .select('id, user_id, role, status')
        .eq('organization_id', orgId);

      return {
        earningTypes: et || [],
        deductionTypes: dt || [],
        audit: al || [],
        users: (om || []).map((m: any) => ({
          id: m.id,
          username: m.user_id?.slice(0, 8) || 'user',
          display_name: `User ${m.user_id?.slice(0, 6) || ''}`,
          role: m.role || 'member',
          status: m.status || 'active',
        })),
      };
    } catch (e) {
      console.error('Error fetching settings data from Supabase:', e);
      return { earningTypes: [], deductionTypes: [], audit: [], users: [] };
    }
  }

  try {
    const earningTypes = all(
      'SELECT * FROM earning_types WHERE organization_id = ? ORDER BY name',
      orgId
    );
    const deductionTypes = all(
      'SELECT * FROM deduction_types WHERE organization_id = ? ORDER BY name',
      orgId
    );
    const audit = all(
      'SELECT * FROM audit_log WHERE organization_id = ? ORDER BY id DESC LIMIT 20',
      orgId
    );
    const users = all(
      "SELECT u.id, u.username, u.display_name, u.role, u.status FROM users u JOIN organization_members om ON om.user_id = u.id WHERE om.organization_id = ? AND om.status = 'active'",
      orgId
    );
    return { earningTypes, deductionTypes, audit, users };
  } catch {
    return { earningTypes: [], deductionTypes: [], audit: [], users: [] };
  }
}


export interface ReportFilters {
  business?: string;
  from?: string;
  to?: string;
  employee?: string;
}

export async function getReportEmployees(orgId: number | null | undefined): Promise<IdNameOption[]> {
  if (!orgId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('last_name');

      return (data || []).map((e) => ({
        id: Number(e.id),
        name: `${e.last_name}, ${e.first_name}`,
      }));
    } catch {
      return [];
    }
  }

  try {
    return idNameOptions(
      "SELECT e.id, (e.last_name || ', ' || e.first_name) AS name FROM employees e WHERE e.organization_id = ? AND e.status = 'active' ORDER BY name",
      orgId
    );
  } catch {
    return [];
  }
}

export async function getReportsData(orgId: number | null | undefined, filters: ReportFilters) {
  const businessFilter = filters.business || '';
  const from = filters.from || '';
  const to = filters.to || '';
  const employeeFilter = filters.employee || '';

  if (!orgId) {
    return {
      summaryRows: { periods: 0, employees: 0, gross: 0, deductions: 0, net: 0 },
      byBusiness: [],
      empReport: [],
      dedReport: [],
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let pQuery = supabase
        .from('payroll')
        .select('*, businesses(name)')
        .eq('organization_id', orgId)
        .eq('status', 'finalized');

      if (businessFilter) pQuery = pQuery.eq('business_id', Number(businessFilter));
      if (from) pQuery = pQuery.gte('payroll_period_end', from);
      if (to) pQuery = pQuery.lte('payroll_period_start', to);

      const { data: payrollsRaw } = await pQuery;
      const payrolls = payrollsRaw || [];

      const periods = payrolls.length;
      let employeesCount = 0;
      let gross = 0;
      let deductions = 0;
      let net = 0;

      for (const p of payrolls) {
        employeesCount += Number(p.employee_count || 0);
        gross += Number(p.total_gross || 0);
        deductions += Number(p.total_deductions || 0);
        net += Number(p.total_net || 0);
      }

      const summaryRows = { periods, employees: employeesCount, gross, deductions, net };

      // By business
      const { data: bList } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('organization_id', orgId)
        .order('name');

      const byBusMap = new Map<string, { net: number; periods: number }>();
      for (const b of bList || []) {
        if (!businessFilter || String(b.id) === businessFilter) {
          byBusMap.set(b.name, { net: 0, periods: 0 });
        }
      }
      for (const p of payrolls) {
        const bName = p.businesses?.name || 'Business';
        const cur = byBusMap.get(bName) || { net: 0, periods: 0 };
        cur.net += Number(p.total_net || 0);
        cur.periods += 1;
        byBusMap.set(bName, cur);
      }
      const byBusiness = Array.from(byBusMap.entries()).map(([name, data]) => ({
        name,
        net: data.net,
        periods: data.periods,
      }));

      // Employee items & deduction report
      const payrollIds = payrolls.map((p) => Number(p.id));
      let empReport: any[] = [];
      let dedReport: any[] = [];

      if (payrollIds.length > 0) {
        let piQuery = supabase
          .from('payroll_items')
          .select(`
            gross_pay, total_deductions, net_pay, employee_id,
            employees ( first_name, last_name, employee_id ),
            payroll ( payroll_period_start, payroll_period_end )
          `)
          .in('payroll_id', payrollIds);

        if (employeeFilter) {
          piQuery = piQuery.eq('employee_id', Number(employeeFilter));
        }

        const { data: piData } = await piQuery;
        empReport = (piData || []).map((pi: any) => ({
          first_name: pi.employees?.first_name || '',
          last_name: pi.employees?.last_name || '',
          employee_id: pi.employees?.employee_id || '',
          payroll_period_start: pi.payroll?.payroll_period_start || '',
          payroll_period_end: pi.payroll?.payroll_period_end || '',
          gross_pay: Number(pi.gross_pay || 0),
          total_deductions: Number(pi.total_deductions || 0),
          net_pay: Number(pi.net_pay || 0),
        })).sort((a: any, b: any) => a.last_name.localeCompare(b.last_name));

        const { data: dedRaw } = await supabase
          .from('payroll_item_deductions')
          .select('name, amount, payroll_items!inner(payroll_id, employee_id)')
          .in('payroll_items.payroll_id', payrollIds);

        const dedAgg = new Map<string, { total: number; empSet: Set<number> }>();
        for (const d of dedRaw || []) {
          const empId = Number((d.payroll_items as any)?.employee_id);
          const cur = dedAgg.get(d.name) || { total: 0, empSet: new Set<number>() };
          cur.total += Number(d.amount || 0);
          if (empId) cur.empSet.add(empId);
          dedAgg.set(d.name, cur);
        }
        dedReport = Array.from(dedAgg.entries()).map(([name, val]) => ({
          name,
          total: val.total,
          employees: val.empSet.size,
        })).sort((a, b) => a.name.localeCompare(b.name));
      }

      return { summaryRows, byBusiness, empReport, dedReport };
    } catch (e) {
      console.error('Error fetching reports data from Supabase:', e);
      return {
        summaryRows: { periods: 0, employees: 0, gross: 0, deductions: 0, net: 0 },
        byBusiness: [],
        empReport: [],
        dedReport: [],
      };
    }
  }

  try {
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

    const dedClauses: string[] = ["p.organization_id = ?"];
    const dedParams: unknown[] = [orgId];
    if (businessFilter) { dedClauses.push('p.business_id = ?'); dedParams.push(Number(businessFilter)); }
    if (from) { dedClauses.push('p.payroll_period_end >= ?'); dedParams.push(from); }
    if (to) { dedClauses.push('p.payroll_period_start <= ?'); dedParams.push(to); }
    const dedReport = all(
      `SELECT pid.name, SUM(pid.amount) AS total, COUNT(DISTINCT pi.employee_id) AS employees
       FROM payroll_item_deductions pid
       JOIN payroll_items pi ON pi.id = pid.payroll_item_id
       JOIN payroll p ON p.id = pi.payroll_id AND p.status = 'finalized'
       WHERE ${dedClauses.join(' AND ')}
       GROUP BY pid.name ORDER BY pid.name`,
      ...dedParams
    );

    return { summaryRows, byBusiness, empReport, dedReport };
  } catch {
    return {
      summaryRows: { periods: 0, employees: 0, gross: 0, deductions: 0, net: 0 },
      byBusiness: [],
      empReport: [],
      dedReport: [],
    };
  }
}

