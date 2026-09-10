'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Shield } from 'lucide-react';
import { PRICING_TIERS, type PricingTier } from './data';
import { useTheme } from '@/components/ThemeProvider';
import { SpotlightCard } from './SpotlightCard';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function PricingCard({ tier }: { tier: PricingTier }) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const { highlight } = tier;

  return (
    <motion.div
      variants={item}
      whileHover={{
        scale: 1.03,
        y: -8,
        transition: { duration: 0.25, ease: EASE },
      }}
      className={`group relative flex h-full flex-col justify-between rounded-xl border p-6 transition-all duration-300 ${
        highlight
          ? isDark
            ? 'border-white bg-white text-slate-900 shadow-lg hover:shadow-2xl hover:shadow-white/20'
            : 'border-slate-900 bg-slate-900 text-white shadow-lg hover:shadow-2xl hover:shadow-slate-900/30'
          : isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500 hover:shadow-2xl hover:shadow-slate-900/50'
            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/10'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
          Most Popular
        </span>
      )}

      <div>
        <h3 className={`text-lg font-semibold ${highlight ? (isDark ? 'text-slate-900' : 'text-white') : (isDark ? 'text-white' : 'text-slate-900')}`}>
          {tier.name}
        </h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${highlight ? (isDark ? 'text-slate-900' : 'text-white') : (isDark ? 'text-white' : 'text-slate-900')}`}>
            {tier.price}
          </span>
          <span className={`text-sm ${highlight ? (isDark ? 'text-slate-500' : 'text-slate-300') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
            {tier.period}
          </span>
        </div>
        <p className={`mt-2 text-sm ${highlight ? (isDark ? 'text-slate-500' : 'text-slate-300') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
          {tier.description}
        </p>
        <ul className="mt-6 space-y-2.5">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check
                className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-emerald-400' : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`}
              />
              <span className={highlight ? (isDark ? 'text-slate-600' : 'text-slate-200') : (isDark ? 'text-slate-300' : 'text-slate-600')}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/register"
        className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-all active:scale-[0.98] ${
          highlight
            ? isDark
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-white text-slate-900 hover:bg-slate-100'
            : isDark
              ? 'bg-white text-slate-900 hover:bg-slate-100'
              : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {tier.cta}
      </Link>
    </motion.div>
  );
}

export function Pricing() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <section id="pricing" className={`border-t py-20 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center"
        >
          <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Simple, transparent pricing
          </h2>
          <p className={`mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Choose the plan that fits your business.</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 grid grid-cols-1 items-stretch gap-6 pt-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {PRICING_TIERS.map((tier) => (
            <SpotlightCard key={tier.name}>
              <PricingCard tier={tier} />
            </SpotlightCard>
          ))}
        </motion.div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          Plans are illustrative — billing integration coming soon.
        </p>
      </div>
    </section>
  );
}