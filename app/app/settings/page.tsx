import { redirect } from 'next/navigation';
import { all } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { formatDate } from '@/lib/format';
import { PageHeader, Badge } from '@/components/ui';
import { SettingsForm } from '@/components/SettingsForm';
import { TypeManager, type TypeRow } from '@/components/TypeManager';
import { SeedSetup } from '@/components/SeedSetup';
import { PasswordForm } from '@/components/PasswordForm';
import { ModuleManager } from '@/components/ModuleManager';
import {
  Sliders,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
  Users,
  Database,
  History,
  ShieldAlert,
  LayoutGrid,
} from 'lucide-react';

import { getSettings, getSettingsAsync } from '@/lib/settings';
import { getOrganizationModules, getOrganizationModulesAsync } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  if (!orgId) redirect('/organization/setup');
  const settings = await getSettingsAsync();
  const modules = await getOrganizationModulesAsync(orgId);
  const userRole = (user.organization_role || user.role || '').toLowerCase();
  const canManageModules = userRole === 'owner' || userRole === 'admin';

  const earningTypes = all(
    'SELECT * FROM earning_types WHERE organization_id = ? ORDER BY name',
    orgId
  ) as unknown as TypeRow[];
  const deductionTypes = all(
    'SELECT * FROM deduction_types WHERE organization_id = ? ORDER BY name',
    orgId
  ) as unknown as TypeRow[];

  const audit = all(
    'SELECT * FROM audit_log WHERE organization_id = ? ORDER BY id DESC LIMIT 20',
    orgId
  );
  const users = all(
    "SELECT u.id, u.username, u.display_name, u.role, u.status FROM users u JOIN organization_members om ON om.user_id = u.id WHERE om.organization_id = ? AND om.status = 'active'",
    orgId
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Compliance Rules"
        subtitle="Manage Philippine statutory contributions, user authorization, and system defaults"
      />

      {/* Row 1: Core Configuration & Security */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-sage-100 text-sage-800 dark:bg-sage-900/50 dark:text-sage-300">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Payroll Rules & Currency</h3>
              <p className="text-xs text-[var(--text-muted)]">Organization default currency and statutory defaults</p>
            </div>
          </div>
          <SettingsForm settings={settings} />
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Security & Password</h3>
              <p className="text-xs text-[var(--text-muted)]">Update your administrative credentials and access keys</p>
            </div>
          </div>
          <PasswordForm />
        </div>
      </div>

      {/* Modular Feature System & Extensions */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
          <div className="p-2 rounded-lg bg-sage-100 text-sage-800 dark:bg-sage-900/50 dark:text-sage-300">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Feature Modules & System Extensions
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Activate modular capabilities and add-ons according to your organization subscription plan.
            </p>
          </div>
        </div>
        <ModuleManager modules={modules} canManage={canManageModules} />
      </div>

      {/* Row 2: Earnings & Deductions catalog */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Earning Types</h3>
              <p className="text-xs text-[var(--text-muted)]">Taxable allowances, bonuses, and incentives catalog</p>
            </div>
          </div>
          <TypeManager kind="earning" types={earningTypes} />
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">
              <MinusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Deduction Types</h3>
              <p className="text-xs text-[var(--text-muted)]">Company loans, HMO, cash advances, and deductions</p>
            </div>
          </div>
          <TypeManager kind="deduction" types={deductionTypes} />
        </div>
      </div>

      {/* Row 3: Admin Accounts & Demo Data */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Authorized Admin Accounts</h3>
              <p className="text-xs text-[var(--text-muted)]">Personnel with Maker-Checker sign-off privileges</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-[var(--text-muted)]">
                  <th className="py-2">User ID</th>
                  <th className="py-2">Display Name</th>
                  <th className="py-2 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((u) => (
                  <tr key={String(u.id)} className="hover:bg-[var(--surface-raised)] transition-colors">
                    <td className="py-3 font-mono font-medium text-[var(--text-primary)]">{String(u.username)}</td>
                    <td className="py-3 text-[var(--text-secondary)]">{String(u.display_name)}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sage-100 text-sage-900 border border-sage-200 dark:bg-sage-950/60 dark:text-sage-200 dark:border-sage-800">
                        {String(u.role).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Sample Data Setup</h3>
              <p className="text-xs text-[var(--text-muted)]">Preload 5 Philippine business entities and sample rosters</p>
            </div>
          </div>
          <SeedSetup />
        </div>
      </div>

      {/* Row 4: Audit Trail */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Compliance Audit Trail</h3>
            <p className="text-xs text-[var(--text-muted)]">Immutable timestamped logs of all administrative payroll changes</p>
          </div>
        </div>

        {audit.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No audit records recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="th">Timestamp</th>
                  <th className="th">Action Trigger</th>
                  <th className="th">Entity Reference</th>
                  <th className="th">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {audit.map((a) => (
                  <tr key={String(a.id)} className="table-row">
                    <td className="td text-xs text-[var(--text-muted)] whitespace-nowrap">{formatDate(String(a.created_at))}</td>
                    <td className="td font-mono text-xs font-semibold text-[var(--accent)]">{String(a.action)}</td>
                    <td className="td font-medium text-[var(--text-primary)]">
                      {String(a.entity)} {a.entity_id ? <span className="text-xs text-[var(--text-muted)] font-mono">#{String(a.entity_id)}</span> : ''}
                    </td>
                    <td className="td max-w-md truncate text-xs text-[var(--text-muted)]">{String(a.details || '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}