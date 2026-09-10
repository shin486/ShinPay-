-- ShinPay+ Modular Feature Architecture Schema
-- Defines system module registry and per-organization activation status

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,               -- e.g. 'payroll', 'attendance', 'leave'
  label TEXT NOT NULL,               -- Display name
  description TEXT,                  -- Human-readable summary of capability
  category TEXT NOT NULL DEFAULT 'core', -- 'core' | 'workforce' | 'compliance' | 'self_service'
  is_core INTEGER NOT NULL DEFAULT 0, -- 1 = cannot be disabled
  icon TEXT,                         -- Lucide icon name reference
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organization_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enabled INTEGER NOT NULL DEFAULT 0, -- 1 = active, 0 = inactive
  enabled_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(organization_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_org_modules_lookup 
  ON organization_modules(organization_id, module_id, enabled);

