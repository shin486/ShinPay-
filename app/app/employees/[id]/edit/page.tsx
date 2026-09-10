import { redirect } from 'next/navigation';
import { all, get, idNameOptions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { EmployeeForm } from '@/components/EmployeeForm';
import type { IdNameOption } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const id = Number(params.id);
  const row = get('SELECT * FROM employees WHERE id = ? AND organization_id = ?', id, orgId);
  if (!row) return <EmptyState title="Employee not found" />;
  const businesses: IdNameOption[] = idNameOptions("SELECT id, name FROM businesses WHERE organization_id = ? AND status = 'active' ORDER BY name", orgId);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Employee" subtitle={`${String(row.first_name)} ${String(row.last_name)}`} />
      <Card>
        <EmployeeForm
          businesses={businesses}
          employeeId={id}
          showSalary={false}
          initial={{
            employee_id: String(row.employee_id),
            first_name: String(row.first_name),
            middle_name: String(row.middle_name ?? ''),
            last_name: String(row.last_name),
            suffix: String(row.suffix ?? ''),
            date_of_birth: String(row.date_of_birth ?? ''),
            contact_number: String(row.contact_number ?? ''),
            email: String(row.email ?? ''),
            address: String(row.address ?? ''),
            business_id: Number(row.business_id),
            position: String(row.position ?? ''),
            employment_status: String(row.employment_status),
            date_hired: String(row.date_hired ?? ''),
          }}
        />
      </Card>
    </div>
  );
}