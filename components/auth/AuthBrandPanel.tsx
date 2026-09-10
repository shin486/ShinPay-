'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Lock,
  CheckCircle2,
  Building,
} from 'lucide-react';

export function AuthBrandPanel() {
  return (
    <div
      className="relative hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14"
      style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 12, 16, 0.4)',
      }}
    >
      {/* Ambient background glow orbs for panel */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -left-16 top-20 h-96 w-96 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(83,108,81,0.35) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 right-10 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(106,134,104,0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* Top Header: SparkPayroll Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #6a8668 0%, #435641 100%)',
              boxShadow: '0 0 20px rgba(83, 108, 81, 0.4)',
            }}
          >
            <Zap className="h-5 w-5 text-white fill-white" strokeWidth={0} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                ShinPay+
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-sage-200 border border-sage-500/30"
                style={{ background: 'rgba(83, 108, 81, 0.20)' }}
              >
                Workforce OS
              </span>
            </div>
            <p className="text-xs text-slate-400">Tactile Payroll &amp; Workforce Operations</p>
          </div>
        </div>
      </div>

      {/* Middle Content: SaaS Value Proposition & Preview */}
      <div className="relative z-10 my-auto py-8 max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/30 bg-sage-500/10 px-3 py-1 text-xs font-medium text-sage-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Multi-Business Commercial Payroll Engine
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.18] font-sans">
          Payroll management,{' '}
          <span className="bg-gradient-to-r from-sage-300 via-emerald-200 to-sage-400 bg-clip-text text-transparent">
            simplified for your business.
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
          Manage employees, statutory contributions, and multi-entity business operations from one modern, automated platform.
        </p>

        {/* ── Commercial SaaS Financial Card Preview ── */}
        <div
          className="mt-8 rounded-2xl border p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-emerald-500/40"
          style={{
            background: 'rgba(16, 22, 18, 0.85)',
            borderColor: 'rgba(135, 162, 133, 0.22)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(135, 162, 133, 0.12)',
          }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Current Period Disbursement</p>
                <p className="text-[10px] text-slate-400">Automated statutory calculation &amp; tax reconciliation</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
              <CheckCircle2 className="h-3 w-3" /> Reconciled
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Net Disbursed</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-white">₱384,250.00</p>
              <p className="text-[10px] text-emerald-400 font-medium mt-0.5">100% Verified</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Staff</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-white">24 Staff</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Direct Deposit</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Workspace</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-white">Multi-Entity</p>
              <p className="text-[10px] text-sage-300 font-medium mt-0.5">Automated Rules</p>
            </div>
          </div>

          {/* Statutory Breakdown Preview */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">BIR Tax &amp; SSS Compliance</span>
                <span className="text-slate-300 font-semibold">100% Calculated</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-sage-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature & Security Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {[
            { icon: ShieldCheck, text: 'BIR, SSS, PhilHealth & Pag-IBIG' },
            { icon: FileCheck, text: 'Digital PDF Payslips' },
            { icon: Lock, text: 'Multi-Tenant Encrypted Isolation' },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Icon className="h-3.5 w-3.5 text-sage-400 shrink-0" />
                <span>{feat.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer: System Status */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.08] pt-6">
        <p>© {new Date().getFullYear()} ShinPay+ Workspace. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All Systems Operational
          </span>
        </div>
      </div>
    </div>
  );
}
