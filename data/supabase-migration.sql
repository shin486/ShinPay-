-- ==============================================================================
-- ShinPay+ — Enterprise Multi-Tenant PostgreSQL Schema for Supabase
-- Run this complete script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. User Profiles (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- owner | admin | member
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. Multi-Tenant Organizations & Membership
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_type TEXT,
  country TEXT NOT NULL DEFAULT 'Philippines',
  address TEXT,
  contact_number TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner | admin | payroll_staff | viewer
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free', -- free | starter | business | enterprise
  status TEXT NOT NULL DEFAULT 'active', -- active | past_due | cancelled | trialing
  employee_limit INT NOT NULL DEFAULT 10,
  business_limit INT NOT NULL DEFAULT 1,
  current_employee_count INT NOT NULL DEFAULT 0,
  trial_ends_at TIMESTAMPTZ,
  billing_email TEXT,
  subscription_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE TABLE IF NOT EXISTS public.invitations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | expired | cancelled
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. Modular Feature Gating Architecture
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,               -- e.g. 'payroll', 'attendance', 'leave'
  label TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'core', -- core | workforce | compensation | self_service
  is_core INT NOT NULL DEFAULT 0,    -- 1 = mandatory system core
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_modules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  enabled INT NOT NULL DEFAULT 0,
  enabled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, module_id)
);

-- ==============================================================================
-- 5. Workforce & Business Entities
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  address TEXT,
  contact_information TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  business_type TEXT,
  payroll_frequency TEXT NOT NULL DEFAULT 'semi-monthly',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  suffix TEXT,
  date_of_birth DATE,
  contact_number TEXT,
  email TEXT,
  address TEXT,
  position TEXT,
  department TEXT,
  employment_status TEXT NOT NULL DEFAULT 'Regular', -- Regular | Probationary | Contractual
  employment_type TEXT NOT NULL DEFAULT 'Full-time',  -- Full-time | Part-time
  date_hired DATE,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_salary (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  salary_type TEXT NOT NULL DEFAULT 'monthly', -- monthly | daily | hourly
  basic_rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  payroll_frequency TEXT NOT NULL DEFAULT 'semi-monthly',
  effective_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. Earnings & Deductions Catalog and Allocations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.earning_types (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  calculation_type TEXT NOT NULL DEFAULT 'fixed', -- fixed | percentage
  is_taxable INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.employee_earnings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  earning_type_id BIGINT NOT NULL REFERENCES public.earning_types(id),
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  effective_date DATE,
  one_time INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deduction_types (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.employee_deductions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  deduction_type_id BIGINT NOT NULL REFERENCES public.deduction_types(id),
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  effective_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. Payroll Processing & Snapshots
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payroll (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  payroll_period_start DATE NOT NULL,
  payroll_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  payroll_frequency TEXT NOT NULL DEFAULT 'semi-monthly',
  status TEXT NOT NULL DEFAULT 'draft', -- draft | calculated | for_review | finalized | cancelled
  total_gross NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_net NUMERIC(14,2) NOT NULL DEFAULT 0,
  employee_count INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  finalized_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.payroll_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  payroll_id BIGINT NOT NULL REFERENCES public.payroll(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  overtime NUMERIC(14,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(14,2) NOT NULL DEFAULT 0,
  commissions NUMERIC(14,2) NOT NULL DEFAULT 0,
  other_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.payroll_item_earnings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payroll_item_id BIGINT NOT NULL REFERENCES public.payroll_items(id) ON DELETE CASCADE,
  earning_type_id BIGINT REFERENCES public.earning_types(id),
  name TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.payroll_item_deductions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payroll_item_id BIGINT NOT NULL REFERENCES public.payroll_items(id) ON DELETE CASCADE,
  deduction_type_id BIGINT REFERENCES public.deduction_types(id),
  name TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.payslips (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payroll_item_id BIGINT NOT NULL REFERENCES public.payroll_items(id) ON DELETE CASCADE,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_id BIGINT NOT NULL REFERENCES public.payroll(id) ON DELETE CASCADE,
  pdf_storage_path TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id)
);

-- ==============================================================================
-- 8. Audit Logs, Settings & Onboarding Tracking
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id BIGINT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  completed INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(organization_id, step)
);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- ==============================================================================
-- 9. Automatic Profile Creation Trigger on Supabase Auth Sign Up
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 10. Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_businesses_org ON public.businesses(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_org ON public.employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_bus ON public.employees(business_id);
CREATE INDEX IF NOT EXISTS idx_payroll_org ON public.payroll(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_bus ON public.payroll(business_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_pay ON public.payroll_items(payroll_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_emp ON public.payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_modules ON public.organization_modules(organization_id, module_id, enabled);

-- ==============================================================================
-- 11. Multi-Tenant Row Level Security (RLS) Helper Function & Policies
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = auth.uid() AND status = 'active';
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_item_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_item_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Organizations: Accessible only by member users or owner
CREATE POLICY "Org members select organization" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_org_ids()) OR owner_id = auth.uid());

CREATE POLICY "Users insert organization" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Org owners update organization" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id IN (SELECT public.get_user_org_ids()) OR owner_id = auth.uid());

-- Organization Members: Accessible by active members of that org
CREATE POLICY "Org members select members" ON public.organization_members
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()) OR user_id = auth.uid());

CREATE POLICY "Users insert membership" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Org owners update membership" ON public.organization_members
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

-- Subscriptions: Org members and owners can view and manage subscription
CREATE POLICY "Org members select subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Users insert subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org owners update subscription" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

-- Businesses: Scoped to user's organizations
CREATE POLICY "Org members access businesses" ON public.businesses
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Employees: Scoped to user's organizations
CREATE POLICY "Org members access employees" ON public.employees
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members access employee_salary" ON public.employee_salary
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members access employee_earnings" ON public.employee_earnings
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members access employee_deductions" ON public.employee_deductions
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Payroll: Scoped to user's organizations
CREATE POLICY "Org members access payroll" ON public.payroll
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members access payroll_items" ON public.payroll_items
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members access payroll_item_earnings" ON public.payroll_item_earnings
  FOR ALL TO authenticated
  USING (payroll_item_id IN (
    SELECT id FROM public.payroll_items WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

CREATE POLICY "Org members access payroll_item_deductions" ON public.payroll_item_deductions
  FOR ALL TO authenticated
  USING (payroll_item_id IN (
    SELECT id FROM public.payroll_items WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

CREATE POLICY "Org members access payslips" ON public.payslips
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Onboarding Steps & Modules
CREATE POLICY "Org members access onboarding" ON public.onboarding_steps
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Org members access org_modules" ON public.organization_modules
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()) OR organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Org members access audit_logs" ON public.audit_logs
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Modules Catalog & Earning/Deduction Types: readable by all authenticated users
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules readable by all" ON public.modules FOR SELECT TO authenticated USING (true);

ALTER TABLE public.earning_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Earning types readable" ON public.earning_types FOR ALL TO authenticated USING (true);

ALTER TABLE public.deduction_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deduction types readable" ON public.deduction_types FOR ALL TO authenticated USING (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings readable" ON public.settings FOR SELECT TO authenticated USING (true);

-- ==============================================================================
-- 12. Seed Master Reference Catalog & Philippine Statutory Defaults
-- ==============================================================================

-- 12a. Modules Catalog
INSERT INTO public.modules (id, label, description, category, is_core, icon)
VALUES
  ('payroll', 'Payroll Processing & Finalization', 'Core calculation engine, maker-checker sign-off, and statutory deductions.', 'core', 1, 'Banknote'),
  ('employees', 'Employee Directory & Compensation', 'Personnel records, DOLE daily rate equivalent calculations, and compensation history.', 'core', 1, 'Users'),
  ('businesses', 'Multi-Business Legal Entities', 'Branches and operating subsidiaries under central organization ownership.', 'core', 1, 'Building2'),
  ('reports', 'Statutory Reports & Exports', 'DOLE/BIR tax reports, audit logs, and PESONet/BPI corporate banking exports.', 'core', 1, 'BarChart3'),
  ('settings', 'Compliance Rules & Admin', 'Philippine statutory contribution ceilings, currencies, and account credentials.', 'core', 1, 'Settings'),
  ('attendance', 'Attendance & Biometric Sync', 'Time card tracking, tardiness, undertime, and biometric clock integrations.', 'workforce', 0, 'Clock'),
  ('overtime', 'DOLE Overtime & Night Diff Engine', '125% regular OT, 130% rest day OT, and 110% night differential calculations.', 'compensation', 0, 'Flame'),
  ('leave', 'Leave & Vacation Tracking', 'Service Incentive Leave (SIL), sick leave accruals, and maternity/paternity tracking.', 'workforce', 0, 'Calendar'),
  ('loans', 'Company Loans & Cash Advances', 'Amortization schedules, salary deduction instalments, and balance tracking.', 'compensation', 0, 'CreditCard'),
  ('commissions', 'Sales Commissions & Bonuses', 'Tiered commission quotas, 13th-month accruals, and performance bonus pools.', 'compensation', 0, 'Award'),
  ('employee_portal', 'Employee Self-Service (ESS)', 'Worker portal for digital payslip download, SIL filing, and tax forms.', 'self_service', 0, 'Smartphone'),
  ('notifications', 'Automated SMS & Email Alerts', 'Automatic payslip dispatch and pay day disbursement alerts to personnel.', 'self_service', 0, 'Bell')
ON CONFLICT (id) DO NOTHING;

-- 12b. Standard Earning Types
INSERT INTO public.earning_types (name, description, calculation_type)
VALUES
  ('Basic Salary', 'Standard periodic base salary', 'fixed'),
  ('Transportation Allowance', 'De minimis transportation allowance', 'fixed'),
  ('Overtime', 'DOLE certified overtime pay', 'fixed'),
  ('Bonus', 'Performance incentive or 13th month bonus', 'fixed'),
  ('Commission', 'Sales performance commission', 'fixed'),
  ('Incentive', 'Quarterly productivity incentive', 'fixed')
ON CONFLICT DO NOTHING;

-- 12c. Philippine Statutory Deduction Types
INSERT INTO public.deduction_types (name, description, calculation_type)
VALUES
  ('SSS', 'Social Security System mandatory contribution', 'percentage'),
  ('PhilHealth', 'Philippine Health Insurance contribution', 'percentage'),
  ('Pag-IBIG', 'Pag-IBIG / HDMF mandatory contribution', 'fixed'),
  ('Withholding Tax', 'BIR TRAIN law withholding compensation tax', 'percentage'),
  ('Cash Advance', 'Company salary cash advance repayment', 'fixed'),
  ('Employee Loan', 'Company or emergency loan repayment', 'fixed')
ON CONFLICT DO NOTHING;

-- 12d. System Settings
INSERT INTO public.settings (key, value)
VALUES
  ('system_name', 'ShinPay+ Workforce & Payroll OS'),
  ('currency_symbol', '₱'),
  ('sss_rate', '0'),
  ('philhealth_rate', '0'),
  ('pagibig_amount', '0'),
  ('tax_rate', '0')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 13. Helper RPC Functions
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_email_by_identifier(identifier TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users
  WHERE LOWER(email) = LOWER(identifier)
     OR LOWER(raw_user_meta_data->>'username') = LOWER(identifier)
     OR LOWER(raw_user_meta_data->>'display_name') = LOWER(identifier)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_identifier(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_organization_for_user(
  org_name TEXT,
  org_slug TEXT,
  org_business_type TEXT DEFAULT NULL,
  org_country TEXT DEFAULT 'Philippines',
  org_address TEXT DEFAULT NULL,
  org_contact_number TEXT DEFAULT NULL,
  org_email TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_org_id BIGINT;
  curr_user_id UUID;
BEGIN
  curr_user_id := auth.uid();
  IF curr_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Insert Organization
  INSERT INTO public.organizations (name, slug, owner_id, business_type, country, address, contact_number, email)
  VALUES (org_name, org_slug, curr_user_id, org_business_type, org_country, org_address, org_contact_number, org_email)
  RETURNING id INTO new_org_id;

  -- 2. Insert Organization Member as owner
  INSERT INTO public.organization_members (organization_id, user_id, role, status)
  VALUES (new_org_id, curr_user_id, 'owner', 'active')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  -- 3. Insert Subscription
  INSERT INTO public.subscriptions (organization_id, plan, employee_limit, business_limit)
  VALUES (new_org_id, 'free', 10, 1)
  ON CONFLICT (organization_id) DO NOTHING;

  -- 4. Insert Onboarding Steps
  INSERT INTO public.onboarding_steps (organization_id, step, completed)
  VALUES
    (new_org_id, 'organization_created', 1),
    (new_org_id, 'business_added', 0),
    (new_org_id, 'employee_added', 0),
    (new_org_id, 'compensation_configured', 0),
    (new_org_id, 'first_payroll', 0)
  ON CONFLICT (organization_id, step) DO NOTHING;

  RETURN new_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organization_for_user TO authenticated;



