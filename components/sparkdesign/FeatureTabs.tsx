'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Calculator,
  Lock,
  History,
  CheckCircle2,
  Sparkles,
  GitCompare,
  Clock,
  FileText,
  UserCheck,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export function FeatureTabs() {
  const [perspective, setPerspective] = useState<'admin' | 'employee'>('admin');
  const [capabilityTab, setCapabilityTab] = useState<'compensation' | 'governance' | 'snapshots'>('compensation');

  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with Admin vs Employee Perspective Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              Precision tools for payroll admins. Radical clarity for employees.
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Toggle between the HR administrator console and employee mobile experience to preview exact governance, compensation formulas, and snapshot tools.
            </p>
          </div>

          {/* Perspective Switcher */}
          <div className="flex items-center rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-100/70 dark:bg-sage-950/80 p-1.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setPerspective('admin')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                perspective === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-sage-600" />
              Payroll Manager View
            </button>
            <button
              type="button"
              onClick={() => setPerspective('employee')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                perspective === 'employee'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-sage-600" />
              Employee Self-Service (ESS)
            </button>
          </div>
        </div>

        {/* Capability Sub-Navigation Tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-sage-200 dark:border-sage-800/80 pb-3">
          {[
            { id: 'compensation', label: 'Compensation Canvas', icon: Calculator },
            { id: 'governance', label: 'Access & Approval Governance', icon: Lock },
            { id: 'snapshots', label: 'Revision & Snapshot History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = capabilityTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCapabilityTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-sage-600 text-white shadow-xs'
                    : 'bg-sage-50 dark:bg-sage-950/60 text-slate-600 dark:text-slate-400 hover:bg-sage-100 dark:hover:bg-sage-900/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Capability Card */}
        <div className="mt-8 rounded-3xl border border-sage-200 dark:border-sage-800 bg-white dark:bg-slate-900/80 p-6 sm:p-10 shadow-lg shadow-sage-900/5">
          <AnimatePresence mode="wait">
            
            {/* 1. Compensation Canvas */}
            {capabilityTab === 'compensation' && (
              <motion.div
                key="tab-compensation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                    {perspective === 'admin' ? 'Administrative Calculation Suite' : 'Personal Compensation Breakdown'}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                    Deterministic Gross-to-Net Math Engine
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {perspective === 'admin'
                      ? 'Live gross-to-net calculation engine enforcing latest Philippine statutory rules (SSS, PhilHealth 5%, Pag-IBIG HDMF, and BIR TRAIN tax brackets) with zero rounding errors.'
                      : 'Crystal-clear breakdown of your earnings, tax-exempt allowances, overtime hours, and mandatory statutory contributions. Understand every single peso deducted.'}
                  </p>
                  <ul className="mt-6 space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Automatic proration of basic monthly, daily, or hourly rates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>SSS WISP & Mandatory Provident Fund calculation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Real-time non-taxable de minimis allowance optimization</span>
                    </li>
                  </ul>
                </div>

                {/* Mock Financial Breakdown Preview */}
                <div className="lg:col-span-7 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-slate-950 p-5">
                  <div className="flex items-center justify-between border-b border-sage-200 dark:border-sage-800 pb-3 mb-4 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold">Sofia Morales • Sr. Product Designer</span>
                    </div>
                    <span className="text-sage-600 dark:text-sage-400 font-semibold">
                      {perspective === 'admin' ? 'Semi-Monthly Payroll' : 'My Current Pay'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-sage-200/80 dark:border-sage-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-sage-100 dark:border-sage-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Basic Rate (₱60,000 / mo)</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">₱30,000.00</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-sage-100 dark:border-sage-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Approved Overtime (4.0 hrs @ 125%)</span>
                      <span className="font-mono font-semibold text-emerald-600">+₱1,562.50</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-sage-100 dark:border-sage-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Non-Taxable Rice Subsidy (De Minimis)</span>
                      <span className="font-mono font-semibold text-emerald-600">+₱1,000.00</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                      <span>Statutory Deductions (SSS ₱1,125 + PhilHealth ₱750 + HDMF ₱100)</span>
                      <span className="font-mono font-semibold">-₱1,975.00</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                      <span>Withholding Tax (BIR TRAIN Tier 2)</span>
                      <span className="font-mono font-semibold">-₱1,842.20</span>
                    </div>
                    <div className="pt-3 border-t-2 border-sage-200 dark:border-sage-700 flex justify-between items-center font-bold">
                      <span className="text-slate-900 dark:text-slate-100">Net Take-Home Pay</span>
                      <span className="text-base font-mono text-emerald-600 dark:text-emerald-400">₱28,745.30</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Access & Approval Governance */}
            {capabilityTab === 'governance' && (
              <motion.div
                key="tab-governance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                    Dual Authorization & Security
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                    Strict Maker-Checker Separation of Duties
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Protect payroll integrity. Prevent unauthorized edits by enforcing multi-step approvals: HR drafts timesheets and compensation, Finance reviews statutory variances, and Executives authorize the final bank disbursal.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-md bg-sage-100 dark:bg-sage-900/50 px-2.5 py-1 text-xs font-semibold text-sage-800 dark:text-sage-300">
                      HR Specialist (Maker)
                    </span>
                    <span className="rounded-md bg-sage-100 dark:bg-sage-900/50 px-2.5 py-1 text-xs font-semibold text-sage-800 dark:text-sage-300">
                      Finance Lead (Checker)
                    </span>
                    <span className="rounded-md bg-sage-100 dark:bg-sage-900/50 px-2.5 py-1 text-xs font-semibold text-sage-800 dark:text-sage-300">
                      Disbursal Officer (Approver)
                    </span>
                  </div>
                </div>

                {/* Mock Workflow Governance Table */}
                <div className="lg:col-span-7 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-slate-950 p-4">
                  <div className="rounded-xl border border-sage-200/80 dark:border-sage-800 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                    <div className="bg-sage-100/60 dark:bg-sage-950/60 px-4 py-2.5 border-b border-sage-200 dark:border-sage-800 flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Approval Step</span>
                      <span>Authorized Officer</span>
                      <span>Status</span>
                    </div>
                    <div className="divide-y divide-sage-100 dark:divide-sage-900">
                      {[
                        { step: '1. DTR & Timecard Reconciliation', officer: 'Maria Santos (HR)', status: 'Approved', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
                        { step: '2. Statutory Deductions & Tax Audit', officer: 'James Chen (Finance)', status: 'Approved', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
                        { step: '3. Corporate Bank Advice Release', officer: 'Elena Rostova (MD)', status: 'Pending Sign-off', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
                      ].map((item, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{item.step}</p>
                            <p className="text-slate-400 text-[11px]">{item.officer}</p>
                          </div>
                          <span className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-medium ${item.badge}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Revision & Snapshot History */}
            {capabilityTab === 'snapshots' && (
              <motion.div
                key="tab-snapshots"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                    Audit-Proof History
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                    Immutable Historical Snapshots
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Diff recalculations before finalization. Once locked, every single calculation row is stored in frozen snapshot tables (`payroll_items`, `payroll_item_earnings`, `payroll_item_deductions`). Even if you update salaries or BIR tax tables in the future, past payouts never alter.
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <History className="h-4 w-4 text-sage-600" />
                    <span>Permanent audit trails with ISO timestamp logging</span>
                  </div>
                </div>

                {/* Mock Snapshot Diff Timeline */}
                <div className="lg:col-span-7 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-slate-950 p-4">
                  <div className="space-y-3">
                    {[
                      { title: 'Run Finalized & Frozen', by: 'Elena R. (Disbursal)', time: 'Today, 2:15 PM', desc: 'Batch frozen. 28 payslips generated, bank hash advice exported.' },
                      { title: 'Recalculation v2 (Draft)', by: 'James C. (Finance)', time: 'Today, 11:30 AM', desc: 'Adjusted overtime approval for 2 employees (+₱3,125.00 net variance).' },
                      { title: 'Initial Draft Created', by: 'Maria S. (HR)', time: 'Yesterday, 4:00 PM', desc: 'Synced timesheets from biometric reader. Initial gross: ₱941,875.00.' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3 text-xs transition-colors ${
                          idx === 0
                            ? 'border-sage-400 bg-sage-100/50 dark:bg-sage-950/60 dark:border-sage-700'
                            : 'border-sage-200 dark:border-sage-900 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <GitCompare className="h-3.5 w-3.5 text-sage-600" />
                            {item.title}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{item.time}</span>
                        </div>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

