import { init } from '@/lib/init';
import { LoginForm } from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  init();
  return <LoginForm />;
}