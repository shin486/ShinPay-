'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUpRight, CheckCircle2, FileText, Code2 } from 'lucide-react';
import { PAYROLL_TEMPLATES, type PayrollRuleTemplate } from './data';

const CATEGORIES = ['All', 'Statutory Compliance', 'Shift & Overtime', 'Benefits & Allowances', 'Year-End 13th Month'] as const;

export function ProjectLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalTemplate, setActiveModalTemplate] = useState<PayrollRuleTemplate | null>(null);

  const filteredTemplates =
    selectedCategory === 'All'
      ? PAYROLL_TEMPLATES
      : PAYROLL_TEMPLATES.filter((p) => p.category === selectedCategory);

  return (
    <section id="library" className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              Curated payroll & statutory rule kits.
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Inspect pre-built formulas for Philippine statutory compliance, overtime multipliers, non-taxable allowances, and 13th-month proration.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-sage-950/70 p-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-sage-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveModalTemplate(template)}
                className="group cursor-pointer rounded-3xl border border-sage-200/80 dark:border-sage-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-sage-400 dark:hover:border-sage-600 hover:shadow-xl hover:shadow-sage-900/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Category Pill & Authority */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="rounded-md bg-sage-100 dark:bg-sage-950 px-2 py-0.5 text-sage-800 dark:text-sage-300 font-semibold border border-sage-200/60 dark:border-sage-800">
                      {template.category}
                    </span>
                    <span className="truncate max-w-[140px]">{template.authority.split('(')[0]}</span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-sage-700 dark:group-hover:text-sage-300 transition-colors font-sans">
                    {template.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {template.summary}
                  </p>

                  {/* Formula Code Snippet Box */}
                  <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 p-2.5 border border-sage-100 dark:border-sage-900 font-mono text-[11px] text-sage-800 dark:text-sage-300 truncate">
                    <Code2 className="inline-block h-3.5 w-3.5 mr-1 text-sage-600" />
                    {template.formula}
                  </div>
                </div>

                {/* Footer Tag list & Action */}
                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-sage-100 dark:border-sage-900 items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-sage-50 dark:bg-sage-950 px-2 py-0.5 text-[10px] font-mono text-sage-700 dark:text-sage-400 border border-sage-200/50 dark:border-sage-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-sage-600 dark:text-sage-400 group-hover:translate-x-0.5 transition-transform">
                      Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Interactive Inspect Rule Dialog Modal */}
        <AnimatePresence>
          {activeModalTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModalTemplate(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.04, y: 20 }}
                className="relative z-10 w-full max-w-2xl rounded-3xl border border-sage-200 dark:border-sage-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveModalTemplate(null)}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-sage-600 dark:text-sage-400">
                  <span>{activeModalTemplate.category}</span>
                  <span>•</span>
                  <span>{activeModalTemplate.authority}</span>
                </div>

                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                  {activeModalTemplate.title}
                </h3>

                {/* Formula Highlight */}
                <div className="mt-4 rounded-2xl bg-sage-50 dark:bg-slate-950 p-4 border border-sage-200 dark:border-sage-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sage-700 dark:text-sage-400 mb-1 font-mono">
                    Deterministic Math Formula
                  </p>
                  <code className="text-xs font-mono text-slate-800 dark:text-slate-200 block break-words">
                    {activeModalTemplate.formula}
                  </code>
                </div>

                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeModalTemplate.summary}
                </p>

                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
                    Included Compliance Deliverables
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeModalTemplate.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200/80 dark:border-sage-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-sage-100 dark:border-sage-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalTemplate(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Close Rule Spec
                  </button>
                  <a
                    href="#demo"
                    onClick={() => setActiveModalTemplate(null)}
                    className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white px-5 py-2 text-xs font-semibold shadow-xs"
                  >
                    Test in Live Sandbox
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

