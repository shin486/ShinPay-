import { init } from '@/lib/init';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  init();
  return <RegisterForm />;
}