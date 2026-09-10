import { Suspense } from 'react';
import { init } from '@/lib/init';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password — ShinPay+',
  description: 'Set a new password for your ShinPay+ account.',
};

export default function ResetPasswordPage() {
  init();
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-slate-400">
          Loading password reset portal…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
