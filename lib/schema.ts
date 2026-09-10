import fs from 'node:fs';
import path from 'node:path';
import { getDb, transaction, getDataDir } from './db';
import { SAMPLE_BUSINESSES, SAMPLE_EMPLOYEES } from './seed-data';

/**
 * Creates the full database schema. DDL lives in data/schema-part*.sql. All
 * non-core configuration data (earnings/deductions/settings) is stored in the
 * database so rules and reference types can be changed without code changes.
 */
export function createSchema(): void {
  const dir = getDataDir();
  const files = [
    'schema-part1.sql',
    'schema-part2.sql',
    'schema-part3.sql',
    'schema-part4.sql',
    'schema-part5.sql',
    'schema-part6.sql',
    'schema-part7.sql',
  ];
  const db = getDb();
  for (const f of files) {
    const filePath = path.join(dir, f);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        try {
          db.exec(stmt + ';');
        } catch (err) {
          // Ignore "duplicate column" errors from ALTER TABLE on existing databases
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
            console.warn(`Schema warning in ${f}: ${msg}`);
          }
        }
      }
    }
  }
  seedDefaults();
}

/** Seed only configuration reference data (no businesses or employees). */
function seedDefaults(): void {
  transaction(() => {
    const db = getDb();

    const earningTypes: Array<[string, string, string]> = [
      ['Basic Salary', 'Standard periodic salary', 'fixed'],
      ['Transportation Allowance', 'Transportation allowance', 'fixed'],
      ['Overtime', 'Overtime pay', 'fixed'],
      ['Bonus', 'One-time bonus', 'fixed'],
      ['Commission', 'Commission earnings', 'fixed'],
      ['Incentive', 'Performance incentive', 'fixed'],
    ];
    const earnExists = db.prepare('SELECT COUNT(*) AS c FROM earning_types').get() as {
      c: number;
    };
    if (Number(earnExists.c) === 0) {
      for (const [name, description, calc] of earningTypes) {
        db.prepare(
          'INSERT INTO earning_types (name, description, calculation_type) VALUES (?, ?, ?)'
        ).run(name, description, calc);
      }
    }

    const deductionTypes: Array<[string, string, string]> = [
      ['SSS', 'Social Security System contribution', 'percentage'],
      ['PhilHealth', 'Philippine Health Insurance contribution', 'percentage'],
      ['Pag-IBIG', 'Pag-IBIG / HDMF contribution', 'fixed'],
      ['Withholding Tax', 'Tax withheld on compensation', 'percentage'],
      ['Cash Advance', 'Cash advance repayment', 'fixed'],
      ['Employee Loan', 'Company loan repayment', 'fixed'],
    ];
    const dedExists = db.prepare('SELECT COUNT(*) AS c FROM deduction_types').get() as {
      c: number;
    };
    if (Number(dedExists.c) === 0) {
      for (const [name, description, calc] of deductionTypes) {
        db.prepare(
          'INSERT INTO deduction_types (name, description, calculation_type) VALUES (?, ?, ?)'
        ).run(name, description, calc);
      }
    }

    const defaults: Record<string, string> = {
      system_name: 'RA Payroll System',
      currency_symbol: '\u20B1', // ₱
      sss_rate: '0',
      philhealth_rate: '0',
      pagibig_amount: '0',
      tax_rate: '0',
    };
    for (const [key, value] of Object.entries(defaults)) {
      const exists = db.prepare('SELECT COUNT(*) AS c FROM settings WHERE key = ?').get(key) as {
        c: number;
      };
      if (Number(exists.c) === 0) {
        db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
      }
    }

    const defaultModules: Array<{
      id: string;
      label: string;
      description: string;
      category: string;
      is_core: number;
      icon: string;
    }> = [
      {
        id: 'payroll',
        label: 'Payroll Processing & Finalization',
        description: 'Core calculation engine, maker-checker sign-off, and BIR/DOLE statutory deductions.',
        category: 'core',
        is_core: 1,
        icon: 'Banknote',
      },
      {
        id: 'employees',
        label: 'Employee Directory & Compensation',
        description: 'Personnel records, DOLE 26-day daily equivalent calculation, and salary tiers.',
        category: 'core',
        is_core: 1,
        icon: 'Users',
      },
      {
        id: 'businesses',
        label: 'Multi-Business Legal Entities',
        description: 'Branches and operating subsidiaries under central organization ownership.',
        category: 'core',
        is_core: 1,
        icon: 'Building2',
      },
      {
        id: 'reports',
        label: 'Statutory Reports & Exports',
        description: 'DOLE/BIR tax reports, audit logs, and PESONet/BPI corporate banking exports.',
        category: 'core',
        is_core: 1,
        icon: 'BarChart3',
      },
      {
        id: 'settings',
        label: 'Compliance Rules & Admin',
        description: 'Philippine statutory contribution ceilings, currencies, and account credentials.',
        category: 'core',
        is_core: 1,
        icon: 'Settings',
      },
      {
        id: 'attendance',
        label: 'Attendance & Biometric Sync',
        description: 'Time card tracking, tardiness, undertime, and biometric clock integrations.',
        category: 'workforce',
        is_core: 0,
        icon: 'Clock',
      },
      {
        id: 'overtime',
        label: 'DOLE Overtime & Night Diff Engine',
        description: '125% regular OT, 130% rest day OT, and 110% night differential calculations.',
        category: 'compensation',
        is_core: 0,
        icon: 'Flame',
      },
      {
        id: 'leave',
        label: 'Leave & Vacation Tracking',
        description: 'Service Incentive Leave (SIL), sick leave accruals, and maternity/paternity tracking.',
        category: 'workforce',
        is_core: 0,
        icon: 'Calendar',
      },
      {
        id: 'loans',
        label: 'Company Loans & Cash Advances',
        description: 'Amortization schedules, salary deduction instalments, and balance tracking.',
        category: 'compensation',
        is_core: 0,
        icon: 'CreditCard',
      },
      {
        id: 'commissions',
        label: 'Sales Commissions & Bonuses',
        description: 'Tiered commission quotas, 13th-month accruals, and performance bonus pools.',
        category: 'compensation',
        is_core: 0,
        icon: 'Award',
      },
      {
        id: 'employee_portal',
        label: 'Employee Self-Service (ESS)',
        description: 'Worker portal for digital payslip download, SIL filing, and tax forms.',
        category: 'self_service',
        is_core: 0,
        icon: 'Smartphone',
      },
      {
        id: 'notifications',
        label: 'Automated SMS & Email Alerts',
        description: 'Automatic payslip dispatch and pay day disbursement alerts to personnel.',
        category: 'self_service',
        is_core: 0,
        icon: 'Bell',
      },
    ];

    for (const mod of defaultModules) {
      try {
        const exists = db.prepare('SELECT id FROM modules WHERE id = ?').get(mod.id);
        if (!exists) {
          db.prepare(
            'INSERT INTO modules (id, label, description, category, is_core, icon) VALUES (?, ?, ?, ?, ?, ?)'
          ).run(mod.id, mod.label, mod.description, mod.category, mod.is_core, mod.icon);
        }
      } catch {
        // ignore if modules table is not yet created
      }
    }
  });
}

export interface CreateAdminOptions {
  username?: string;
  password?: string;
  displayName?: string;
  passwordHash?: string;
}

/** Create the administrator user and ensure a default organization exists. */
export function ensureAdminUser(opts: CreateAdminOptions = {}): void {
  const db = getDb();

  // 1. Ensure admin user exists
  const existing = db
    .prepare('SELECT id FROM users WHERE role = ? OR username = ?')
    .get('admin', 'admin') as { id: number } | undefined;

  let adminId: number;
  if (!existing) {
    const username = opts.username || 'admin';
    const displayName = opts.displayName || 'Administrator';

    let hash: string;
    if (opts.passwordHash) {
      hash = opts.passwordHash;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
      const password = opts.password || 'admin123';
      hash = bcrypt.hashSync(password, 10);
    }

    const res = db
      .prepare(
        'INSERT INTO users (username, password_hash, display_name, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(username, hash, displayName, displayName, 'admin', 'active');
    adminId = Number(res.lastInsertRowid);
  } else {
    adminId = Number(existing.id);
  }

  // 2. Ensure default organization exists
  let org = db
    .prepare('SELECT id FROM organizations ORDER BY id ASC LIMIT 1')
    .get() as { id: number } | undefined;
  let orgId: number;

  if (!org) {
    const orgRes = db
      .prepare(
        'INSERT INTO organizations (name, slug, owner_id, business_type, country) VALUES (?, ?, ?, ?, ?)'
      )
      .run('RA Group of Companies', 'ra-group', adminId, 'Conglomerate', 'Philippines');
    orgId = Number(orgRes.lastInsertRowid);
  } else {
    orgId = Number(org.id);
  }

  // 3. Ensure all existing users are active members of this organization
  const allUsers = db.prepare('SELECT id, role FROM users').all() as Array<{
    id: number;
    role: string;
  }>;
  for (const u of allUsers) {
    const member = db
      .prepare('SELECT id FROM organization_members WHERE organization_id = ? AND user_id = ?')
      .get(orgId, u.id);
    if (!member) {
      db.prepare(
        'INSERT INTO organization_members (organization_id, user_id, role, status) VALUES (?, ?, ?, ?)'
      ).run(orgId, u.id, u.role === 'admin' ? 'owner' : 'member', 'active');
    }
  }

  // 4. Ensure subscription exists
  const sub = db
    .prepare('SELECT id FROM subscriptions WHERE organization_id = ?')
    .get(orgId);
  if (!sub) {
    db.prepare(
      'INSERT INTO subscriptions (organization_id, plan, employee_limit, business_limit) VALUES (?, ?, ?, ?)'
    ).run(orgId, 'business', 100, 10);
  }

  // 5. Ensure onboarding steps are marked completed
  const steps = [
    'organization_created',
    'business_added',
    'employee_added',
    'compensation_configured',
    'first_payroll',
  ];
  for (const step of steps) {
    const s = db
      .prepare('SELECT id FROM onboarding_steps WHERE organization_id = ? AND step = ?')
      .get(orgId, step);
    if (!s) {
      db.prepare(
        'INSERT INTO onboarding_steps (organization_id, step, completed) VALUES (?, ?, ?)'
      ).run(orgId, step, 1);
    }
  }

  // 6. Ensure default reference types are bound to this org
  try {
    db.prepare('UPDATE earning_types SET organization_id = ? WHERE organization_id IS NULL').run(
      orgId
    );
    db.prepare(
      'UPDATE deduction_types SET organization_id = ? WHERE organization_id IS NULL'
    ).run(orgId);
  } catch {
    // ignore
  }

  // 6b. Ensure all catalog modules are provisioned for this organization
  try {
    const allMods = db.prepare('SELECT id, is_core FROM modules').all() as Array<{
      id: string;
      is_core: number;
    }>;
    for (const mod of allMods) {
      const existingLink = db
        .prepare('SELECT id FROM organization_modules WHERE organization_id = ? AND module_id = ?')
        .get(orgId, mod.id);
      if (!existingLink) {
        db.prepare(
          'INSERT INTO organization_modules (organization_id, module_id, enabled, enabled_at) VALUES (?, ?, ?, ?)'
        ).run(
          orgId,
          mod.id,
          mod.is_core === 1 ? 1 : 0,
          mod.is_core === 1 ? new Date().toISOString() : null
        );
      }
    }
  } catch {
    // ignore
  }

  // 7. Ensure default client businesses and employees exist
  const busCount = db
    .prepare('SELECT COUNT(*) AS c FROM businesses WHERE organization_id = ?')
    .get(orgId) as { c: number };

  if (Number(busCount.c) === 0) {
    transaction(() => {
      const businessIds = new Map<string, number>();
      for (const b of SAMPLE_BUSINESSES) {
        const existingB = db.prepare('SELECT id FROM businesses WHERE code = ?').get(b.code) as
          | { id: number }
          | undefined;
        if (existingB) {
          db.prepare('UPDATE businesses SET organization_id = ? WHERE id = ?').run(
            orgId,
            existingB.id
          );
          businessIds.set(b.code, Number(existingB.id));
        } else {
          const res = db
            .prepare(
              'INSERT INTO businesses (name, code, description, organization_id) VALUES (?, ?, ?, ?)'
            )
            .run(b.name, b.code, b.description, orgId);
          businessIds.set(b.code, Number(res.lastInsertRowid));
        }
      }

      for (const emp of SAMPLE_EMPLOYEES) {
        const busId = businessIds.get(emp.business_code);
        if (!busId) continue;
        const existingEmp = db
          .prepare('SELECT id FROM employees WHERE employee_id = ?')
          .get(emp.employee_id) as { id: number } | undefined;

        if (existingEmp) {
          db.prepare('UPDATE employees SET organization_id = ? WHERE id = ?').run(
            orgId,
            existingEmp.id
          );
        } else {
          const res = db
            .prepare(
              `INSERT INTO employees (employee_id, business_id, organization_id, first_name, last_name, position, employment_status)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .run(
              emp.employee_id,
              busId,
              orgId,
              emp.first_name,
              emp.last_name,
              emp.position,
              emp.employment_status
            );
          const empDbId = Number(res.lastInsertRowid);
          db.prepare(
            `INSERT INTO employee_salary (employee_id, organization_id, salary_type, basic_rate, payroll_frequency)
             VALUES (?, ?, ?, ?, ?)`
          ).run(empDbId, orgId, emp.salary_type, emp.basic_rate, emp.payroll_frequency);
        }
      }
    });
  }
}