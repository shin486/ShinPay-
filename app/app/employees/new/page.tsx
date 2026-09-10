import { redirect } from 'next/navigation';
import { idNameOptions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { PageHeader, Card } from '@/components/ui';
import { EmployeeForm } from '@/components/EmployeeForm';
import type { IdNameOption } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function NewEmployeePage() {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const businesses: IdNameOption[] = idNameOptions("SELECT id, name FROM businesses WHERE organization_id = ? AND status = 'active' ORDER BY name", orgId);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Add Employee" subtitle="Create a new employee record" />
      <Card>
        <EmployeeForm businesses={businesses} />
      </Card>
    </div>
  );
}