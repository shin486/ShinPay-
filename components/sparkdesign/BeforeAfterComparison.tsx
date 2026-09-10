'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, FileSpreadsheet, ShieldAlert, Sparkles, FileText, Check, AlertTriangle } from 'lucide-react';

const OLD_WAY_PAIN_POINTS = [
  {
    title: 'Emailed Excel timesheets',
    desc: 'Manually copied and pasted every cut-off. Formulas break when rows are inserted.',
  },
  {
    title: 'Printed BIR tax tables',
    desc: 'Marked up with highlighters and sticky notes. Human transposition errors on tax brackets.',
  },
  {
    title: 'PhilHealth rate change panic',
    desc: 'Takes 3 sleepless days to audit and update dozens of decentralized department workbooks.',
  },
  {
    title: 'Password-protected PDF emails',
    desc: 'Staff forget birthdays or passwords, resulting in HR answering 40+ duplicate inquiries every payday.',
  },
  {
    title: 'Zero verifiable audit trail',
    desc: '"Who changed Marcus’s overtime rate?" — "Ask Janet, she has the final v4_FINAL.xlsx file."',
  },
];

const SHINPAY_RESOLUTIONS = [
  {
    title: 'Biometric clock-in auto-sync',
    desc: 'Attendance logs flow directly from hardware and mobile clocks into the deterministic payroll calculation engine.',
  },
  {
    title: 'Automated BIR TRAIN computation',
    desc: 'Precise graduated brackets computed per employee, per cut-off with audit-grade tabular numerals.',
  },
  {
    title: 'One-click statutory rate updates',
    desc: 'SSS MSC caps, PhilHealth 5% splits, and Pag-IBIG ₱200 limits are updated centrally across all entities in seconds.',
  },
  {
    title: 'Frictionless ESS self-service',
    desc: 'Employees view interactive mobile payslips, tax summaries, and loan balances without burdening HR.',
  },
  {
    title: 'Permanent immutable audit log',
    desc: 'Every revision, comment, bonus approval, and bank export is timestamped, signed, and permanently archived.',
  },
];

export function BeforeAfterComparison() {
  return (
    <section id="comparison" className="py-20 lg:py-28 relative overflow-hidden bg-slate-50/50 dark:bg-[#0e130f]/60 border-y border-sage-200/60 dark:border-sage-900/40">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/5 dark:bg-rose-950/10 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-sage-500/10 dark:bg-sage-950/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            From spreadsheet anxiety to absolute clarity.
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            Traditional payroll operations trap finance teams in endless formula debugging and compliance risks. ShinPay+ replaces fragile manual processes with deterministic software.
          </p>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-stretch">
          
          {/* Left Card: The Old Way */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-rose-200/80 dark:border-rose-950/50 bg-white/80 dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg shadow-rose-950/5 relative">
            <div className="flex items-center justify-between pb-5 border-b border-rose-100 dark:border-rose-950/60">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 px-3 py-1 text-xs font-bold">
                  <ShieldAlert className="h-3 w-3" />
                  Before ShinPay+
                </span>
                <h3 className="mt-2.5 text-2xl font-bold text-slate-800 dark:text-slate-200 font-sans line-through decoration-rose-400/70 decoration-2">
                  The Old Way
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            {/* Pain Points List */}
            <div className="mt-6 space-y-4 flex-1">
              {OLD_WAY_PAIN_POINTS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 mt-0.5">
                    <X className="h-3 w-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pain Point Callout */}
            <div className="mt-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300">
              <span className="font-bold">The Reality:</span> 1 in 4 Philippine MSMEs pay penalties due to outdated PhilHealth or SSS contribution tables in legacy Excel templates.
            </div>
          </div>

          {/* Central Interactive Connector Indicator */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center py-4 lg:py-0">
            <div className="hidden lg:flex flex-col items-center gap-3">
              <div className="h-20 w-px bg-gradient-to-b from-rose-200 via-sage-300 to-emerald-400 dark:from-rose-900 dark:via-sage-700 dark:to-emerald-600" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md border border-sage-200 dark:border-sage-700 text-sage-600 dark:text-sage-300 font-mono text-xs font-bold">
                VS
              </div>
              <div className="h-20 w-px bg-gradient-to-b from-emerald-400 via-sage-300 to-sage-200 dark:from-emerald-600 dark:via-sage-700 dark:to-sage-900" />
            </div>
            <div className="lg:hidden flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-sage-200 dark:border-sage-800" />
              <span className="rounded-full bg-sage-100 dark:bg-sage-900 px-3 py-1 text-xs font-bold text-sage-700 dark:text-sage-300">
                UPGRADE TO
              </span>
              <div className="flex-1 h-px bg-sage-200 dark:border-sage-800" />
            </div>
          </div>

          {/* Right Card: The ShinPay+ Way */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border-2 border-sage-400/80 dark:border-sage-600/70 bg-white/95 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-sage-950/5 relative">
            <div className="flex items-center justify-between pb-5 border-b border-sage-100 dark:border-sage-900">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-bold shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ShinPay+ Workspace
                </span>
                <h3 className="mt-2.5 text-2xl font-bold text-sage-900 dark:text-sage-100 font-sans">
                  The ShinPay+ Way
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            {/* Resolutions List */}
            <div className="mt-6 space-y-4 flex-1">
              {SHINPAY_RESOLUTIONS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence Metric Box */}
            <div className="mt-8 rounded-2xl bg-sage-50/90 dark:bg-sage-950/60 border border-sage-300 dark:border-sage-800 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-600 text-white font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Deterministic Accuracy
                  </p>
                  <p className="text-[11px] text-sage-700 dark:text-sage-400">
                    Snapshotted ledger with BIR 2316 compliance
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-1 rounded-md">
                0% Variance
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

