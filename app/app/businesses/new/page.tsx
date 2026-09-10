import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { PageHeader, Card } from '@/components/ui';
import { BusinessForm } from '@/components/BusinessForm';

export const dynamic = 'force-dynamic';

export default async function NewBusinessPage() {
  init();
  if (!(await getCurrentUser())) redirect('/login');
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Business" subtitle="Create a new business or branch" />
      <Card>
        <BusinessForm />
      </Card>
    </div>
  );
}