import { redirect } from 'next/navigation';
import { idNameOptions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { PageHeader, Card } from '@/components/ui';
import { PayrollForm } from '@/components/PayrollForm';
import type { IdNameOption } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function NewPayrollPage() {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const businesses: IdNameOption[] = idNameOptions("SELECT id, name FROM businesses WHERE organization_id = ? AND status = 'active' ORDER BY name", orgId);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Create Payroll" subtitle="Set up a new payroll period for a business" />
      {businesses.length === 0 ? (
        <Card><p className="text-sm text-slate-500">Add a business first before creating payroll.</p></Card>
      ) : (
        <Card><PayrollForm businesses={businesses} /></Card>
      )}
    </div>
  );
}