CREATE TABLE IF NOT EXISTS payroll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  payroll_period_start TEXT NOT NULL,
  payroll_period_end TEXT NOT NULL,
  pay_date TEXT NOT NULL,
  payroll_frequency TEXT NOT NULL DEFAULT 'semi-monthly',
  status TEXT NOT NULL DEFAULT 'draft',
  total_gross REAL NOT NULL DEFAULT 0,
  total_deductions REAL NOT NULL DEFAULT 0,
  total_net REAL NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  finalized_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  finalized_at TEXT
);