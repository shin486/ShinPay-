'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Clock, Calculator, Send } from 'lucide-react';
import { WORKFLOW_STAGES, type WorkflowStage } from './data';

const TAB_ICONS = {
  capture: Clock,
  reconcile: Calculator,
  disburse: Send,
};

export function WorkflowTabs() {
  const [activeStageId, setActiveStageId] = useState<string>(WORKFLOW_STAGES[0].id);
  const activeStage = WORKFLOW_STAGES.find((s) => s.id === activeStageId) ?? WORKFLOW_STAGES[0];

  return (
    <section id="workflow" className="py-24 lg:py-32 bg-sage-50/50 dark:bg-sage-950/20 border-y border-sage-200/70 dark:border-sage-900/50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Capture. Reconcile. Disburse.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            A frictionless three-stage payroll workflow engineered to eliminate spreadsheet errors, guarantee Philippine statutory compliance, and disburse on time.
          </p>
        </div>

        {/* Workflow Tab Buttons */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-2xl border border-sage-200 dark:border-sage-800 bg-white dark:bg-slate-900 p-1.5 shadow-sm">
            {WORKFLOW_STAGES.map((stage) => {
              const Icon = TAB_ICONS[stage.id as keyof typeof TAB_ICONS] ?? Clock;
              const isSelected = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStageId(stage.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'text-slate-950 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="workflow-tab-active-payroll"
                      className="absolute inset-0 rounded-xl bg-sage-100 dark:bg-sage-800/80 border border-sage-300 dark:border-sage-700/60 shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-sage-700 dark:text-sage-300' : 'text-slate-400'}`} />
                  <span>{stage.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabbed Content Card with Photographic Display */}
        <div className="mt-10 rounded-3xl border border-sage-200/90 dark:border-sage-800/80 bg-white dark:bg-slate-900/90 p-6 sm:p-10 shadow-xl shadow-sage-900/5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              
              {/* Left Details */}
              <div className="lg:col-span-6 flex flex-col justify-between h-full">
                <div>
                  <span className="rounded-md bg-sage-100 dark:bg-sage-900/60 px-3 py-1 font-mono text-xs font-semibold text-sage-800 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                    {activeStage.badge}
                  </span>
                  
                  <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                    {activeStage.title} with calm, automated precision.
                  </h3>

                  <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeStage.description}
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    {activeStage.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric pill */}
                <div className="mt-8 pt-6 border-t border-sage-100 dark:border-sage-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {activeStage.statLabel}
                  </span>
                  <span className="font-mono text-xl font-bold text-sage-800 dark:text-sage-200">
                    {activeStage.statValue}
                  </span>
                </div>
              </div>

              {/* Right: Rounded Photography Display */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-sage-200 dark:border-sage-800 shadow-md">
                  <img
                    src={activeStage.image}
                    alt={activeStage.title}
                    className="h-full w-full object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none rounded-2xl" />
                  
                  {/* Floating Stage Indicator */}
                  <div className="absolute bottom-4 left-4 rounded-xl bg-black/65 backdrop-blur-md px-4 py-2 border border-white/10 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sage-300">
                      {activeStage.title} Stage Active
                    </p>
                    <p className="text-[11px] text-slate-200">
                      Immutable snapshots & bank hash validation enabled
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

