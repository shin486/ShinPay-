'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, ArrowRight, Check } from 'lucide-react';
import { resetPasswordAction } from '@/lib/actions/auth-actions';
import { AuthCard } from './AuthCard';
import { AuthHeader } from './AuthHeader';
import { PasswordInput } from './PasswordInput';
import { AuthButton } from './AuthButton';
import { AuthAlert } from './AuthAlert';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const isMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!isMatch) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append('password', password);
        fd.append('confirm_password', confirmPassword);
        fd.append('token', token);

        const res = await resetPasswordAction(fd);
        if (res && !res.ok) {
          setError(res.error || 'Failed to update password.');
        } else {
          setSuccess(true);
        }
      } catch {
        setError('Something went wrong. Please try again.');
      }
    });
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Create a new password"
        subtitle="Enter and confirm your new password below."
        badge="Security Update"
      />

      {success ? (
        <div className="space-y-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Check className="h-7 w-7 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Password updated!</h2>
            <p className="mt-1.5 text-xs text-slate-300">
              Your password has been changed successfully. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/login" className="block w-full">
              <AuthButton
                variant="primary"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Your Account
              </AuthButton>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <AuthAlert
              type="error"
              title="Unable to update password"
              message={error}
            />
          )}

          <div>
            <PasswordInput
              label="New Password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              autoFocus
              disabled={pending}
            />
          </div>

          <div>
            <PasswordInput
              label="Confirm New Password"
              id="confirm_password"
              name="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              disabled={pending}
            />
          </div>

          {/* Password Requirements Checklist */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-slate-300 mb-1">Password requirements:</p>
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
              {hasLetter && hasNumber ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span className={hasLetter && hasNumber ? 'text-emerald-300' : 'text-slate-400'}>
                Contains letters and numbers
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
              loadingText="Updating password…"
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Update Password
            </AuthButton>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
