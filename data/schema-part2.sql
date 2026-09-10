-- Salary history is preserved: a new row is added on change, never overwritten.
CREATE TABLE IF NOT EXISTS employee_salary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  salary_type TEXT NOT NULL DEFAULT 'monthly',   -- monthly | daily | hourly
  basic_rate REAL NOT NULL DEFAULT 0,
  payroll_frequency TEXT NOT NULL DEFAULT 'semi-monthly',
  effective_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS earning_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS employee_earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  earning_type_id INTEGER NOT NULL REFERENCES earning_types(id),
  amount REAL NOT NULL DEFAULT 0,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  effective_date TEXT,
  one_time INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deduction_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS employee_deductions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  deduction_type_id INTEGER NOT NULL REFERENCES deduction_types(id),
  amount REAL NOT NULL DEFAULT 0,
  calculation_type TEXT NOT NULL DEFAULT 'fixed',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  effective_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);