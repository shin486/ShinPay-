'use client';

import { motion } from 'framer-motion';
import { Building2, Laptop, Store, Briefcase, Network, Sparkles } from 'lucide-react';
import { WORKFORCE_INDUSTRIES } from './data';

const INDUSTRY_ICONS = [Building2, Laptop, Store, Briefcase, Network];

export function CreativeRoleRows() {
  return (
    <section className="py-16 overflow-hidden border-y border-sage-200/60 dark:border-sage-900/40 bg-sage-50/40 dark:bg-sage-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-sage-700 dark:text-sage-400">
          Engineered for diverse workforce & industry compensation models
        </p>
      </div>

      {/* Infinite Scrolling Marquee Track 1 */}
      <div className="relative flex overflow-x-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 34 }}
          className="flex gap-4 shrink-0"
        >
          {[...WORKFORCE_INDUSTRIES, ...WORKFORCE_INDUSTRIES].map((ind, idx) => {
            const Icon = INDUSTRY_ICONS[idx % INDUSTRY_ICONS.length];
            return (
              <div
                key={ind.title + idx}
                className="flex items-center gap-3.5 rounded-2xl border border-sage-200 dark:border-sage-800/80 bg-white dark:bg-slate-900/80 px-4 py-3 shadow-2xs hover:border-sage-400 dark:hover:border-sage-600 transition-colors shrink-0"
              >
                {/* 36x36 Photo Thumbnail with Icon Badge */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-sage-200 dark:border-sage-700 bg-sage-100 dark:bg-slate-800">
                  <img
                    src={ind.avatar}
                    alt={ind.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sage-700 text-white shadow-xs">
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                    {ind.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] truncate">
                    {ind.focus}
                  </p>
                </div>
                <span className="ml-2 rounded-md bg-sage-100/80 dark:bg-sage-900/40 px-2 py-0.5 text-[11px] font-mono font-medium text-sage-800 dark:text-sage-200 whitespace-nowrap">
                  {ind.highlight}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Track 2 in Reverse */}
      <div className="relative flex overflow-x-hidden mt-4">
        <motion.div
          animate={{ x: ['-50%', '0%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 40 }}
          className="flex gap-4 shrink-0"
        >
          {[...WORKFORCE_INDUSTRIES, ...WORKFORCE_INDUSTRIES].reverse().map((ind, idx) => {
            const Icon = INDUSTRY_ICONS[(idx + 2) % INDUSTRY_ICONS.length];
            return (
              <div
                key={ind.title + '-rev-' + idx}
                className="flex items-center gap-3.5 rounded-2xl border border-sage-200/80 dark:border-sage-800/60 bg-white/80 dark:bg-slate-900/60 px-4 py-3 shadow-2xs hover:border-sage-400 dark:hover:border-sage-600 transition-colors shrink-0"
              >
                {/* 36x36 Photo Thumbnail with Icon Badge */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-sage-200 dark:border-sage-700 bg-sage-100 dark:bg-slate-800">
                  <img
                    src={ind.avatar}
                    alt={ind.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sage-700 text-white shadow-xs">
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                    {ind.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] truncate">
                    {ind.focus}
                  </p>
                </div>
                <span className="ml-2 rounded-md bg-sage-100/80 dark:bg-sage-900/40 px-2 py-0.5 text-[11px] font-mono font-medium text-sage-800 dark:text-sage-200 whitespace-nowrap">
                  {ind.highlight}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

