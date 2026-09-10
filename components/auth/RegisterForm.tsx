'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { registerAction } from '@/lib/actions/auth-actions';
import { AuthCard } from './AuthCard';
import { AuthHeader } from './AuthHeader';
import { AuthInput } from './AuthInput';
import { PasswordInput } from './PasswordInput';
import { AuthButton } from './AuthButton';
import { AuthAlert } from './AuthAlert';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isMinLength = password.length >= 8;
  const isMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get('full_name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const username = String(fd.get('username') || '').trim();
    const pwd = String(fd.get('password') || '');
    const confirm = String(fd.get('confirm_password') || '');

    if (!fullName) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!username) {
      setError('Please choose a username for your account.');
      return;
    }
    if (pwd.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }
    if (pwd !== confirm) {
      setError('Passwords do not match. Please check and re-enter.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await registerAction(fd);
        if (res && !res.ok) {
          setError(res.error || 'Unable to create account. Please verify your details.');
        } else {
          router.push('/organization/setup');
        }
      } catch {
        setError('Something went wrong during registration. Please try again.');
      }
    });
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Create your account"
        subtitle="Start managing your business payroll with ShinPay+."
        badge="New Workspace"
      />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <AuthAlert
            type="error"
            title="Registration error"
            message={error}
          />
        )}

        <div>
          <AuthInput
            label="Full Name"
            id="full_name"
            name="full_name"
            type="text"
            placeholder="e.g. Juan Dela Cruz"
            icon={<User className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            autoComplete="name"
            required
            autoFocus
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            label="Work Email"
            id="email"
            name="email"
            type="email"
            placeholder="admin@company.com"
            icon={<Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            autoComplete="email"
            required
            disabled={pending}
          />

          <AuthInput
            label="Username"
            id="username"
            name="username"
            type="text"
            placeholder="e.g. juan_admin"
            icon={<User className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            autoComplete="username"
            required
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput
            label="Password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            disabled={pending}
          />

          <PasswordInput
            label="Confirm Password"
            id="confirm_password"
            name="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            required
            disabled={pending}
          />
        </div>

        {/* Dynamic Requirement Checklist */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2">
            {isMinLength ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span className={isMinLength ? 'text-emerald-300' : 'text-slate-400'}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isMatch ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span className={isMatch ? 'text-emerald-300' : 'text-slate-400'}>
              Passwords match
            </span>
          </div>
        </div>

        <div className="pt-2">
          <AuthButton
            type="submit"
            variant="primary"
            isLoading={pending}
            loadingText="Creating account…"
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          >
            Create Account
          </AuthButton>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
        <p className="text-xs text-slate-300">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors ml-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}