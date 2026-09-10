'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { loginAction } from '@/lib/actions/auth-actions';
import { AuthCard } from './AuthCard';
import { AuthHeader } from './AuthHeader';
import { AuthInput } from './AuthInput';
import { PasswordInput } from './PasswordInput';
import { AuthCheckbox } from './AuthCheckbox';
import { AuthButton } from './AuthButton';
import { AuthAlert } from './AuthAlert';

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const username = String(fd.get('username') || '').trim();
    const password = String(fd.get('password') || '');

    if (!username) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await loginAction(fd);
        if (res && !res.ok) {
          setError(res.error || 'The email or password you entered is incorrect.');
        } else {
          const redirectTarget = params.get('redirect');
          const destination =
            redirectTarget &&
            !redirectTarget.includes('organization/setup') &&
            !redirectTarget.includes('register')
              ? redirectTarget
              : '/app';
          router.push(destination);
        }
      } catch {
        setError('Unable to sign in right now. Please try again in a moment.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <AuthAlert
          type="error"
          title="Unable to sign in"
          message={error}
        />
      )}

      <div>
        <AuthInput
          label="Email or Username"
          id="username"
          name="username"
          type="text"
          placeholder="e.g. name@company.com or admin"
          icon={<Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />}
          autoComplete="username"
          required
          autoFocus
          disabled={pending}
        />
      </div>

      <div>
        <PasswordInput
          label="Password"
          id="password"
          name="password"
          placeholder="Enter account password"
          autoComplete="current-password"
          required
          disabled={pending}
          rightAction={
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none focus:underline"
              tabIndex={0}
            >
              Forgot password?
            </Link>
          }
        />
      </div>

      <div className="pt-1 flex items-center justify-between">
        <AuthCheckbox
          id="remember-me"
          name="remember"
          label="Keep me signed in"
          defaultChecked
          disabled={pending}
        />
      </div>

      <div className="pt-2">
        <AuthButton
          type="submit"
          variant="primary"
          isLoading={pending}
          loadingText="Signing in…"
          icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
        >
          Sign In
        </AuthButton>
      </div>
    </form>
  );
}

export function LoginForm() {
  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue to your ShinPay+ payroll account."
        badge="Enterprise SaaS"
      />

      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-slate-400">
            Initializing secure sign-in portal…
          </div>
        }
      >
        <LoginFormInner />
      </Suspense>

      <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
        <p className="text-xs text-slate-300">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors ml-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
          >
            Register now
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}