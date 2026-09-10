import { init } from '@/lib/init';
import { VerifyEmailCard } from '@/components/auth/VerifyEmailCard';

export const metadata = {
  title: 'Verify Email — ShinPay+',
  description: 'Confirm your email address to access ShinPay+.',
};

export default function VerifyEmailPage() {
  init();
  return <VerifyEmailCard />;
}
