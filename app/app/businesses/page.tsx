import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { formatDate } from '@/lib/format';
import { getBusinesses } from '@/lib/queries';
import { PageHeader, StatusBadge, EmptyState, Card } from '@/components/ui';
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Registered Businesses"
        subtitle="Manage your multi-entity corporate units, branches, and employer identification codes."
        actions={
          <Link href="/app/businesses/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span>Add Business Entity</span>
          </Link>
        }
      />

      <BusinessFilters />

      <div className="card flex flex-col overflow-hidden">
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Corporate Units ({rows.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Active registered employers under your organization
            </p>
          </div>
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
            Multi-Tenancy Active
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No businesses found"
              message="Register your first business entity to begin enrolling employees and processing cut-offs."
              action={
                <Link href="/app/businesses/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Business
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="th">Business Name</th>
                  <th className="th">Entity Code</th>
                  <th className="th">Registered Office</th>
                  <th className="th text-right">Headcount</th>
                  <th className="th">Status</th>
                  <th className="th">Registration Date</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={String(b.id)} className="table-row">
                    <td className="td">
                      <Link
                        href={`/app/businesses/${b.id}`}
                        className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {String(b.name)}
                      </Link>
                    </td>
                    <td className="td font-mono text-xs text-[var(--text-secondary)]">
                      <span className="rounded px-2 py-0.5 bg-[var(--surface-raised)] border border-[var(--border)]">
                        {String(b.code)}
                      </span>
                    </td>
                    <td className="td text-[var(--text-secondary)]">{String(b.address ?? '—')}</td>
                    <td className="td text-right">
                      <span className="rounded-md px-2 py-0.5 text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {String(b.employee_count)}
                      </span>
                    </td>
                    <td className="td">
                      <StatusBadge status={String(b.status)} />
                    </td>
                    <td className="td text-xs text-[var(--text-muted)]">{formatDate(String(b.created_at))}</td>
                    <td className="td text-right">
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
