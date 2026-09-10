import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getOnboardingProgress } from '@/lib/auth';
import {
  Check,
  Building2,
  Users,
  Banknote,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const STEP_INFO: Record<string, { label: string; description: string; href: string; icon: any }> = {
  organization_created: {
    label: 'Create organization profile',
    description: 'Establish your legal entity and operational headquarters',
    href: '/organization/setup',
    icon: Building2,
  },
  business_added: {
    label: 'Register business branches',
    description: 'Add operating entities (e.g. Water Refilling, Shuttle Services)',
    href: '/app/businesses/new',
    icon: Building2,
  },
  employee_added: {
    label: 'Add employees',
    description: 'Enlist staff members, assign positions and branches',
    href: '/app/employees/new',
    icon: Users,
  },
  compensation_configured: {
    label: 'Configure compensation & deductions',
    description: 'Set basic rates, SSS, PhilHealth, Pag-IBIG contributions',
    href: '/app/employees',
    icon: Sliders,
  },
  first_payroll: {
    label: 'Disburse first payroll period',
    description: 'Compute earnings, verify net compensation, and generate payslips',
    href: '/app/payroll/new',
    icon: Banknote,
  },
};

export default async function OnboardingPage() {
  init();
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect('/login');
  }
  if (!user.organization_id) redirect('/organization/setup');

  const progress = await getOnboardingProgress(user.organization_id);
  const allDone = progress.completed === progress.total;
  const percentage = Math.round((progress.completed / progress.total) * 100);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4 sm:px-6">
      {/* ── Progress Header ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/30 bg-sage-500/10 px-3.5 py-1 text-xs font-semibold text-sage-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Workspace Onboarding
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-sans">
          Welcome to ShinPay+
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Complete these foundational milestones to configure your multi-business payroll.
        </p>

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Setup Progress</span>
            <span className="text-white font-semibold">{percentage}% Completed ({progress.completed}/{progress.total})</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sage-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Steps List ── */}
      <div className="space-y-3.5">
        {progress.steps.map((step, idx) => {
          const info = STEP_INFO[step.step] || {
            label: step.step,
            description: '',
            href: '#',
            icon: Sparkles,
          };
          const StepIcon = info.icon;

          return (
            <Link
              key={step.step}
              href={info.href}
              className="group relative flex items-center gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-200"
              style={{
                background: step.completed ? 'rgba(34, 197, 94, 0.04)' : 'rgba(18, 21, 26, 0.8)',
                borderColor: step.completed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Step indicator / checkmark */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: step.completed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: step.completed ? '#4ade80' : '#94a3b8',
                  border: step.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {step.completed ? <Check className="h-5 w-5 stroke-[2.5]" /> : idx + 1}
              </div>

              {/* Step text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: step.completed ? '#4ade80' : '#f8fafc' }}
                  >
                    {info.label}
                  </p>
                  {step.completed && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                  {info.description}
                </p>
              </div>

              {/* Action indicator */}
              {!step.completed ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-sage-400 group-hover:text-sage-300 group-hover:translate-x-0.5 transition-all">
                  Start <ArrowRight className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-400">
                  Review
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Completion Banner ── */}
      {allDone && (
        <div
          className="mt-8 rounded-2xl border p-6 text-center shadow-xl"
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
            <Check className="h-6 w-6 stroke-[3]" />
          </div>
          <p className="text-lg font-bold text-white">Setup completed successfully!</p>
          <p className="mt-1 text-xs text-slate-300 max-w-sm mx-auto">
            Your organization, entities, and employee rosters are primed for full-scale payroll runs.
          </p>
          <Link
            href="/app"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg hover:scale-105"
          >
            Launch Main Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── Skip link ── */}
      <div className="mt-8 text-center">
        <Link
          href="/app"
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
        >
          Skip onboarding for now &amp; open dashboard →
        </Link>
      </div>
    </div>
  );
}