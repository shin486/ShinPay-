import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { formatDate } from '@/lib/format';
import { getBusinesses } from '@/lib/queries';
import { StatusBadge, EmptyState } from '@/components/ui';
import { BusinessFilters } from '@/components/BusinessFilters';
import { BusinessActions } from '@/components/BusinessActions';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const q = (searchParams.q || '').trim().toLowerCase();
  const status = searchParams.status || '';

  const allRows = await getBusinesses(orgId);
  const rows = allRows.filter((b) => {
    const text = `${String(b.name)} ${String(b.code)} ${String(b.address ?? '')}`.toLowerCase();
    const matchQ = !q || text.includes(q);
    const matchStatus = !status || String(b.status) === status;
    return matchQ && matchStatus;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-slate-50/70 dark:bg-transparent space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[var(--text-primary)]">
          Registered Businesses
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">
          Manage businesses, branches, and entity codes under your organization.
        </p>
      </div>

      {/* ── Inline Filter Bar & Primary Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <BusinessFilters />

        <Link
          href="/app/businesses/new"
          className="btn-primary inline-flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Business Entity</span>
        </Link>
      </div>

      {/* ── Pure White Elevated Data Table Container ── */}
      <div className="bg-white dark:bg-[var(--surface)] rounded-xl shadow-sm ring-1 ring-gray-200/50 dark:ring-[var(--border)]">
        {rows.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="No businesses found"
              message="Register your first business entity to begin enrolling employees and processing cut-offs."
              action={
                <Link href="/app/businesses/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Business Entity
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/70 dark:divide-[var(--border)]">
              <thead>
                <tr className="bg-gray-50/60 dark:bg-[var(--bg-secondary)]">
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider first:rounded-tl-xl"
                  >
                    Business Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Entity Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Registered Office
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Headcount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Registration Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider last:rounded-tr-xl"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[var(--border)]">
                {rows.map((b) => (
                  <tr
                    key={String(b.id)}
                    className="hover:bg-gray-50/70 dark:hover:bg-[var(--surface-raised)] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/app/businesses/${b.id}`}
                        className="font-semibold text-gray-900 dark:text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {String(b.name)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded-md">
                        {String(b.code)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      {String(b.address ?? '—')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] tabular-nums">
                      {String(b.employee_count ?? 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={String(b.status)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-[var(--text-muted)]">
                      {formatDate(String(b.created_at))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <BusinessActions id={Number(b.id)} status={String(b.status)} />
                    </td>
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
