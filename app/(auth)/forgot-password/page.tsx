import { init } from '@/lib/init';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password — ShinPay+',
  description: 'Recover access to your ShinPay+ payroll account.',
};

export default function ForgotPasswordPage() {
  init();
  return <ForgotPasswordForm />;
}
