'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AuthCard } from './AuthCard';
import { AuthHeader } from './AuthHeader';
import { AuthButton } from './AuthButton';
import { AuthAlert } from './AuthAlert';

interface VerifyEmailCardProps {
  email?: string;
}

export function VerifyEmailCard({ email = 'your registered email' }: VerifyEmailCardProps) {
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleResend() {
    setResendStatus(null);
    startTransition(async () => {
      // Simulate quick resend request
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResendStatus('A fresh verification link has been sent to your email.');
    });
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Verify your email"
        subtitle={`We've dispatched a confirmation link to ${email}.`}
        badge="Email Verification"
      />

      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <Mail className="h-7 w-7 text-blue-400" />
          </div>

          <p className="text-sm font-semibold text-white">
            Check your inbox
          </p>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed max-w-xs">
            Click the link in the message to verify your email address and activate your ShinPay+ workspace.
          </p>
        </div>

        {resendStatus && (
          <AuthAlert
            type="success"
            title="Verification link resent"
            message={resendStatus}
          />
        )}

        <div className="space-y-3">
          <AuthButton
            variant="primary"
            onClick={handleResend}
            isLoading={pending}
            loadingText="Sending email…"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Resend Verification Email
          </AuthButton>

          <Link href="/login" className="block w-full">
            <AuthButton variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Sign In
            </AuthButton>
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
