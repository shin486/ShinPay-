'use client';

import { motion } from 'framer-motion';
import { Sparkles, Calculator, MessageSquare, Smartphone } from 'lucide-react';
import { PRODUCT_BENEFITS } from './data';

const ICONS = [Calculator, MessageSquare, Smartphone];

export function ProductBenefits() {
  return (
    <section id="benefits" className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Eliminate calculation anxiety and pay day chaos.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Ditch fragile spreadsheets, disparate overtime forms, and manual tax lookups. ShinPay+ consolidates workforce compensation into three rock-solid guarantees.
          </p>
        </div>

        {/* 3 Benefit Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRODUCT_BENEFITS.map((benefit, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <motion.div
                key={benefit.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-sage-200/80 dark:border-sage-800/60 bg-white/70 dark:bg-slate-900/40 p-8 shadow-xs hover:border-sage-400 dark:hover:border-sage-600 hover:shadow-xl hover:shadow-sage-900/5 transition-all duration-300 backdrop-blur-sm"
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-950 px-2.5 py-1 rounded-md">
                      {benefit.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100/60 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 group-hover:bg-sage-600 group-hover:text-white transition-colors duration-200">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                    {benefit.tagline}
                  </p>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Bottom Metric Pill */}
                <div className="mt-8 pt-5 border-t border-sage-100 dark:border-sage-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Validated standard
                  </span>
                  <span className="text-xs font-bold font-mono text-sage-800 dark:text-sage-200 bg-sage-50 dark:bg-sage-900/60 px-2.5 py-1 rounded-full border border-sage-200 dark:border-sage-800">
                    {benefit.metrics}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

