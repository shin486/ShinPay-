'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

const WORKPLACE_CLOSING_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    title: 'Creative Studio Payday',
  },
  {
    url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80',
    title: 'Multi-Branch Retail Shifts',
  },
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    title: 'Executive Bank Disbursal',
  },
  {
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    title: 'Audit Reconciliation',
  },
];

export function ClosingSignup() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-sage-50/50 dark:bg-sage-950/30 border-t border-sage-200/70 dark:border-sage-900/50">
      
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[400px] w-[640px] rounded-full bg-sage-200/50 dark:bg-sage-900/20 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Interactive Pointer-Responsive Photo Tiles Row */}
        <div className="mb-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {WORKPLACE_CLOSING_PHOTOS.map((photo, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-sage-200 dark:border-sage-800 shadow-sm"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
              <p className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white truncate drop-shadow-sm font-mono">
                {photo.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing Signup Box */}
        <div className="rounded-3xl border border-sage-300/80 dark:border-sage-800 bg-white dark:bg-slate-900 p-8 sm:p-14 shadow-2xl text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/30 bg-sage-500/10 px-3.5 py-1 text-xs font-semibold text-sage-700 dark:text-sage-300 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Zero Setup Fees • Instant Philippine Compliance Provisioning
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans leading-tight">
            Ready to bring clarity, trust, and calm back to payday?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Spin up your multi-entity payroll workspace in seconds. Comes pre-configured with 2024 BIR withholding formulas, SSS/PhilHealth/Pag-IBIG tables, and bank disbursement files.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white px-8 py-3.5 text-sm font-bold shadow-md hover:shadow-lg hover:shadow-sage-600/25 active:scale-98 transition-all"
            >
              <span>Register Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/50 dark:bg-slate-950/50 hover:bg-sage-100 dark:hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all"
            >
              Sign In to Workspace
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              BIR & Data Privacy Act of 2012 Compliant
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              14-Day Full Multi-Entity Trial
            </span>
            <span className="hidden sm:inline">•</span>
            <span>No credit card required</span>
          </div>
        </div>

      </div>
    </section>
  );
}

