import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettingsAsync } from '@/lib/settings';
import { formatMoney } from '@/lib/format';
import { getBusinessOptions, getEmployees } from '@/lib/queries';
import { PageHeader, StatusBadge, EmptyState, Card } from '@/components/ui';
import { EmployeeFilters } from '@/components/EmployeeFilters';
import { EmployeeActions } from '@/components/EmployeeActions';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { q?: string; business?: string; status?: string };
}) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const q = (searchParams.q || '').trim().toLowerCase();
  const businessFilter = searchParams.business || '';
  const statusFilter = searchParams.status || '';
  
  const settings = await getSettingsAsync();
  const sym = settings.currency_symbol || '\u20B1';

  const businesses = await getBusinessOptions(orgId);
  const allEmployees = await getEmployees(orgId);

  const rows = allEmployees.filter((e) => {
    const name = `${String(e.first_name)} ${String(e.middle_name ?? '')} ${String(e.last_name)}`.toLowerCase();
    const text = `${name} ${String(e.employee_id)}`.toLowerCase();
    const matchQ = !q || text.includes(q);
    const matchBusiness = !businessFilter || String(e.business_id) === businessFilter;
    const matchStatus = !statusFilter || String(e.status) === statusFilter;
    return matchQ && matchBusiness && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Employee Directory"
        subtitle="Manage employee records, compensation packages, statutory IDs, and recurrent deductions."
        actions={
          <Link href="/app/employees/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span>Add New Employee</span>
          </Link>
        }
      />

      <EmployeeFilters businesses={businesses} />

      <div className="card flex flex-col overflow-hidden">
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Enrolled Personnel
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Total of {rows.length} {rows.length === 1 ? 'employee' : 'employees'} registered in this scope
            </p>
          </div>
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
            DOLE Compliant Directory
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No employees found"
              message="Add your first employee or adjust your search filters to view records."
              action={
                <Link href="/app/employees/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Employee
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="th">Employee Details</th>
                  <th className="th">Business Entity</th>
                  <th className="th">Designation</th>
                  <th className="th">Frequency / Type</th>
                  <th className="th text-right">Compensation Rate</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const initials = `${String(e.first_name).charAt(0)}${String(e.last_name).charAt(0)}`.toUpperCase();
                  const rate = Number(e.basic_rate || 0);
                  const isMonthly = String(e.salary_type || '').toLowerCase() === 'monthly';
                  const dailyEquiv = isMonthly && rate > 0 ? (rate / 26).toFixed(2) : null;

                  return (
                    <tr key={String(e.id)} className="table-row">
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0 shadow-sm"
                            style={{
                              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                              boxShadow: '0 0 10px var(--accent-glow)',
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/app/employees/${e.id}`}
                              className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                            >
                              {String(e.first_name)} {String(e.last_name)}
                            </Link>
                            <p className="text-xs text-[var(--text-muted)] font-mono">
                              {String(e.employee_id)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="td">
                        <span className="rounded-md px-2 py-1 text-xs font-medium bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {String(e.business_name)}
                        </span>
                      </td>

                      <td className="td font-medium text-[var(--text-secondary)]">
                        {String(e.position || '—')}
                      </td>

                      <td className="td">
                        <span className="text-xs font-medium capitalize text-[var(--text-muted)]">
                          {String(e.salary_type || 'Monthly')}
                        </span>
                      </td>

                      <td className="td text-right">
                        <p className="font-bold font-mono text-[var(--text-primary)]">
                          {formatMoney(rate, sym)}
                        </p>
                        {dailyEquiv && (
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">
                            ~{sym}{dailyEquiv} / DOLE day
                          </p>
                        )}
                      </td>

                      <td className="td">
                        <StatusBadge status={String(e.status)} />
                      </td>

                      <td className="td text-right">
                        <EmployeeActions id={Number(e.id)} status={String(e.status)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
