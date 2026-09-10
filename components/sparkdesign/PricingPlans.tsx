'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { PRICING_PLANS, type PricingPlan } from './data';

export function PricingPlans() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-sage-50/40 dark:bg-sage-950/20 border-y border-sage-200/60 dark:border-sage-900/40 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Single Business or Multi-Entity Group.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Predictable flat-rate pricing without punitive per-payslip fees or surprise calculation surcharges. Connect any plan directly to the interactive sandbox below.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-sage-200 dark:border-sage-800 bg-white dark:bg-slate-900 p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !annual
                  ? 'bg-sage-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annual
                  ? 'bg-sage-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Annual</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 sm:p-10 transition-all duration-300 ${
                  plan.highlight
                    ? 'border-sage-400 dark:border-sage-600 bg-white dark:bg-slate-900 shadow-xl shadow-sage-900/10 ring-1 ring-sage-400 dark:ring-sage-600'
                    : 'border-sage-200 dark:border-sage-800/80 bg-white/70 dark:bg-slate-900/50 shadow-xs'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sage-600 text-white px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                      {plan.currency}{price.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      / month
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-sage-600 dark:text-sage-400 font-medium">
                    {annual ? `Billed annually (${plan.currency}${(price * 12).toLocaleString()}/yr)` : 'Billed monthly'}
                  </p>

                  {/* Features List */}
                  <div className="mt-8 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      What's included
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-6 border-t border-sage-100 dark:border-sage-800">
                  <Link
                    href="/register"
                    className={`flex items-center justify-center gap-2 w-full rounded-xl py-3 text-xs font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sm hover:shadow-md hover:shadow-sage-600/20'
                        : 'bg-sage-100 dark:bg-sage-900/60 hover:bg-sage-200 dark:hover:bg-sage-800 text-sage-900 dark:text-sage-200'
                    }`}
                  >
                    {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

