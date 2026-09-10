-- Add organization_id to existing tables for multi-tenancy
-- These ALTER TABLE statements are safe to run repeatedly (IF NOT EXISTS where supported).

-- Users: add profile fields
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login_at TEXT;

-- Businesses: add organization_id and additional fields
ALTER TABLE businesses ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE businesses ADD COLUMN business_type TEXT;
ALTER TABLE businesses ADD COLUMN payroll_frequency TEXT NOT NULL DEFAULT 'semi-monthly';
ALTER TABLE businesses ADD COLUMN archived_at TEXT;

-- Employees: add organization_id and additional fields
ALTER TABLE employees ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE employees ADD COLUMN department TEXT;
ALTER TABLE employees ADD COLUMN employment_type TEXT NOT NULL DEFAULT 'Full-time';
ALTER TABLE employees ADD COLUMN archived_at TEXT;

-- Employee compensation history
ALTER TABLE employee_salary ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Earning/Deduction types: scope to organization
ALTER TABLE earning_types ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE earning_types ADD COLUMN calculation_type TEXT NOT NULL DEFAULT 'fixed';
ALTER TABLE earning_types ADD COLUMN is_taxable INTEGER NOT NULL DEFAULT 1;

ALTER TABLE deduction_types ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE deduction_types ADD COLUMN calculation_type TEXT NOT NULL DEFAULT 'fixed';

-- Employee earnings/deductions: add organization scope
ALTER TABLE employee_earnings ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE employee_deductions ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Payroll: add organization scope and additional fields
ALTER TABLE payroll ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE payroll ADD COLUMN created_by INTEGER REFERENCES users(id);
ALTER TABLE payroll ADD COLUMN finalized_by INTEGER REFERENCES users(id);
ALTER TABLE payroll ADD COLUMN notes TEXT;

-- Payroll items: add organization scope
ALTER TABLE payroll_items ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Payslips table (new)
CREATE TABLE IF NOT EXISTS payslips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_item_id INTEGER NOT NULL REFERENCES payroll_items(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  payroll_id INTEGER NOT NULL REFERENCES payroll(id),
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  generated_by INTEGER REFERENCES users(id)
);

-- Onboarding tracking
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  step TEXT NOT NULL, -- organization_created | business_added | employee_added | compensation_configured | first_payroll
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  UNIQUE(organization_id, step)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_org ON businesses(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_business ON employees(business_id);
CREATE INDEX IF NOT EXISTS idx_payroll_org ON payroll(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_business ON payroll(business_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_payroll ON payroll_items(payroll_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);