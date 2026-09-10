'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleModuleAction } from '@/lib/actions/module-actions';
import type { ModuleDefinition } from '@/lib/modules';
import {
  Banknote,
  Users,
  Building2,
  BarChart3,
  Settings,
  Clock,
  Flame,
  Calendar,
  CreditCard,
  Award,
  Smartphone,
  Bell,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Banknote,
  Users,
  Building2,
  BarChart3,
  Settings,
  Clock,
  Flame,
  Calendar,
  CreditCard,
  Award,
  Smartphone,
  Bell,
  Sparkles,
};

const CATEGORY_LABELS: Record<string, { label: string; tone: string }> = {
  core: { label: 'Foundational Core', tone: 'emerald' },
  workforce: { label: 'Workforce & Time', tone: 'blue' },
  compensation: { label: 'Compensation & Benefits', tone: 'amber' },
  self_service: { label: 'Worker Portal & Comms', tone: 'purple' },
};

export function ModuleManager({
  modules,
  canManage,
}: {
  modules: ModuleDefinition[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const coreModules = modules.filter((m) => m.is_core);
  const optionalModules = modules.filter((m) => !m.is_core);

  function handleToggle(moduleId: string, targetState: boolean) {
    if (!canManage) {
      setError('Only Organization Owners and Administrators have permission to toggle modules.');
      return;
    }

    setError(null);
    setSuccess(null);
    setPendingId(moduleId);

    startTransition(async () => {
      const res = await toggleModuleAction(moduleId, targetState);
      setPendingId(null);
      if (res.ok) {
        setSuccess(`Module updated successfully.`);
        router.refresh();
      } else {
        setError(res.error || 'Failed to update module state.');
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Section 1: Core Modules */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Core System Capabilities</h4>
            <p className="text-xs text-[var(--text-muted)]">
              Permanently active for your organization. Required for compliant payroll execution.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Lock className="h-3 w-3" /> Core Protected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coreModules.map((mod) => {
            const Icon = ICON_MAP[mod.icon] || Sparkles;
            return (
              <div
                key={mod.id}
                className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{mod.label}</h5>
                <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">{mod.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Optional Modules / Add-ons */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Optional Modules & Extensions</h4>
            <p className="text-xs text-[var(--text-muted)]">
              Activate modular features to extend your payroll workspace as operations scale.
            </p>
          </div>
          {!canManage && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <ShieldAlert className="h-3.5 w-3.5" /> Read-only mode
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {optionalModules.map((mod) => {
            const Icon = ICON_MAP[mod.icon] || Sparkles;
            const category = CATEGORY_LABELS[mod.category] || { label: 'Add-on', tone: 'slate' };
            const isThisPending = isPending && pendingId === mod.id;

            return (
              <div
                key={mod.id}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${
                  mod.enabled
                    ? 'border-sage-300 bg-sage-50/40 dark:border-sage-700/50 dark:bg-sage-950/20'
                    : 'border-[var(--border)] bg-[var(--surface-raised)] opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      mod.enabled
                        ? 'bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    disabled={!canManage || isThisPending}
                    onClick={() => handleToggle(mod.id, !mod.enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                      mod.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    aria-label={`Toggle ${mod.label}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        mod.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {category.label}
                  </span>
                </div>

                <h5 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{mod.label}</h5>
                <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">{mod.description}</p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span
                    className={`text-[11px] font-semibold ${
                      mod.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {isThisPending ? 'Updating…' : mod.enabled ? '● Active' : '○ Deactivated'}
                  </span>
                  {mod.enabled && mod.enabled_at && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Since {new Date(mod.enabled_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

