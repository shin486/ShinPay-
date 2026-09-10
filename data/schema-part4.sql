-- Snapshots of exactly what was included in a historical calculation.
CREATE TABLE IF NOT EXISTS payroll_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_id INTEGER NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  basic_pay REAL NOT NULL DEFAULT 0,
  overtime REAL NOT NULL DEFAULT 0,
  allowances REAL NOT NULL DEFAULT 0,
  bonuses REAL NOT NULL DEFAULT 0,
  commissions REAL NOT NULL DEFAULT 0,
  other_earnings REAL NOT NULL DEFAULT 0,
  gross_pay REAL NOT NULL DEFAULT 0,
  total_deductions REAL NOT NULL DEFAULT 0,
  net_pay REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payroll_item_earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_item_id INTEGER NOT NULL REFERENCES payroll_items(id) ON DELETE CASCADE,
  earning_type_id INTEGER,
  name TEXT,
  amount REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payroll_item_deductions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_item_id INTEGER NOT NULL REFERENCES payroll_items(id) ON DELETE CASCADE,
  deduction_type_id INTEGER,
  name TEXT,
  amount REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id INTEGER,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);