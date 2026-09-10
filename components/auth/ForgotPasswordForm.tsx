'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { forgotPasswordAction } from '@/lib/actions/auth-actions';
import { AuthCard } from './AuthCard';
import { AuthHeader } from './AuthHeader';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { AuthAlert } from './AuthAlert';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await forgotPasswordAction(fd);
        if (res && !res.ok) {
          setError(res.error || 'Failed to send reset link.');
        } else {
          setSubmittedEmail(email);
        }
      } catch {
        setError('Something went wrong. Please try again.');
      }
    });
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Forgot your password?"
        subtitle="Enter your email address and we'll send you a secure password reset link."
        badge="Account Recovery"
      />

      {submittedEmail ? (
        <div className="space-y-6">
          <AuthAlert
            type="success"
            title="Reset link sent"
            message={`We've dispatched password recovery instructions to ${submittedEmail}. Please check your inbox and spam folder.`}
          />

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-slate-300 leading-relaxed">
            Did not receive the email? Make sure the email address matches your registered ShinPay+ account or try again in a few minutes.
          </div>

          <div className="space-y-3 pt-2">
            <AuthButton
              variant="secondary"
              onClick={() => setSubmittedEmail(null)}
            >
              Send to a different email
            </AuthButton>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors py-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <AuthAlert
              type="error"
              title="Unable to send link"
              message={error}
            />
          )}

          <div>
            <AuthInput
              label="Account Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="e.g. name@company.com"
              icon={<Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />}
              autoComplete="email"
              required
              autoFocus
              disabled={pending}
            />
          </div>

          <div className="pt-2">
            <AuthButton
              type="submit"
              variant="primary"
              isLoading={pending}
              loadingText="Sending reset link…"
              icon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Send Reset Link
            </AuthButton>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
