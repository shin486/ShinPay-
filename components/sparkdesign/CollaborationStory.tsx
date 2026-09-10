'use client';

import { motion } from 'framer-motion';
import { Sparkles, Quote, ShieldCheck, ArrowRight } from 'lucide-react';

export function CollaborationStory() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Documentary Workplace Photography Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-sage-200 dark:border-sage-800 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="HR leader reviewing payroll run"
                  className="h-full w-full object-cover rounded-3xl transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-100/60 dark:bg-sage-950/60 p-4 text-center">
                <p className="font-mono text-2xl font-bold text-sage-900 dark:text-sage-100">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">BIR & SSS statutory accuracy</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="rounded-2xl border border-sage-200 dark:border-sage-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                <p className="text-xs font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">Collaboration</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">Direct item audit notes</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-500 font-mono">Zero unverified exceptions</span>
                </div>
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-sage-200 dark:border-sage-800 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
                  alt="Finance team collaborating on disbursal"
                  className="h-full w-full object-cover rounded-3xl transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Right: Narrative Story & Testimonial Quote */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans leading-tight">
              Payday is a covenant of trust, not a paperwork burden.
            </h2>

            <p className="mt-5 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              When payroll relies on fragmented spreadsheets, late overtime slips, and manual tax calculations, stress spreads across the company. ShinPay+ was engineered so HR and Finance collaborate through clear line-item run notes, immutable recalculation diffs, and instant bank exports—giving employees complete trust in every payslip.
            </p>

            {/* Testimonial Quote Block */}
            <div className="mt-8 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-slate-900/60 p-6 backdrop-blur-sm">
              <Quote className="h-6 w-6 text-sage-600 mb-2" />
              <p className="text-sm font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "We used to spend 3 full days every 15th and 30th checking overtime math and SSS deductions. With ShinPay+, our 60-person studio reconciles attendance, generates bank files, and delivers encrypted payslips in under 20 minutes."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
                  alt="Camille Reyes"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-sage-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Camille Reyes
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Head of People & Finance, Studio Gridworks
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

