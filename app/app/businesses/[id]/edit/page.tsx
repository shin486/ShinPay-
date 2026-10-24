import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getBusiness } from '@/lib/queries';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { BusinessForm } from '@/components/BusinessForm';

export const dynamic = 'force-dynamic';

export default async function EditBusinessPage({ params }: { params: { id: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const id = Number(params.id);
  const row = await getBusiness(id, orgId);
  if (!row) return <EmptyState title="Business not found" />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit Business" subtitle={String(row.name)} />
      <Card>
        <BusinessForm
          businessId={id}
          initial={{
            name: String(row.name),
            code: String(row.code),
            description: String(row.description ?? ''),
            address: String(row.address ?? ''),
            contact_information: String(row.contact_information ?? ''),
          }}
        />
      </Card>
    </div>
  );
}
