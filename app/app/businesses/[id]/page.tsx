import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { formatDate } from '@/lib/format';
import { getBusinessDetail } from '@/lib/queries';
import { PageHeader, Card, StatusBadge, EmptyState } from '@/components/ui';
import { BusinessActions } from '@/components/BusinessActions';
import { Pencil, Users, MapPin, Phone, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const id = Number(params.id);

  const detail = await getBusinessDetail(id, orgId);
  if (!detail || !detail.business) return <EmptyState title="Business not found" />;

  const b = detail.business;
  const employees = detail.employees;

  return (
    <div>
      <PageHeader
        title={String(b.name)}
        subtitle={`${String(b.code)} • created ${formatDate(String(b.created_at))}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/app/businesses/${id}/edit`} className="btn-secondary"><Pencil className="h-4 w-4" /> Edit</Link>
            <BusinessActions id={id} status={String(b.status)} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card title="Business Information">
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs font-medium uppercase text-slate-400">Status</dt><dd className="mt-0.5"><StatusBadge status={String(b.status)} /></dd></div>
              <div><dt className="text-xs font-medium uppercase text-slate-400">Description</dt><dd className="mt-0.5 text-slate-600 dark:text-slate-300">{String(b.description || '—')}</dd></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600 dark:text-slate-300">{String(b.address || '—')}</dd></div>
              <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600 dark:text-slate-300">{String(b.contact_information || '—')}</dd></div>
            </dl>
          </Card>
          <Card title="Summary">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-brand-600" />
              <div><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{String(employees.length)}</p><p className="text-xs text-slate-400">Employees</p></div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card
            title="Employees"
            actions={<Link href="/app/employees/new" className="btn-ghost text-xs"><FileText className="h-3.5 w-3.5" /> Add Employee</Link>}
          >
            {employees.length === 0 ? (
              <EmptyState title="No employees yet" message="Add employees to this business." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead>
                    <tr>
                      <th className="th">Employee ID</th>
                      <th className="th">Name</th>
                      <th className="th">Position</th>
                      <th className="th">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employees.map((e: any) => (
                      <tr key={String(e.id)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="td font-mono text-xs">{String(e.employee_id)}</td>
                        <td className="td">
                          <Link href={`/app/employees/${e.id}`} className="font-medium text-brand-700 dark:text-emerald-400 hover:underline">
                            {String(e.first_name)} {String(e.last_name)}
                          </Link>
                        </td>
                        <td className="td">{String(e.position || '—')}</td>
                        <td className="td"><StatusBadge status={String(e.status)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
