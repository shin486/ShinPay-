'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useTheme } from '@/components/ThemeProvider';
import { SpotlightCard } from './SpotlightCard';
import { STATS, type Stat } from './data';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: import('framer-motion').Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

interface StatCardProps {
  stat: Stat;
  index: number;
}

function StatCard({ stat, index }: StatCardProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <SpotlightCard>
      <motion.div
        variants={item}
        whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
        className={`group relative flex h-full flex-col rounded-xl border p-5 shadow-sm transition-all duration-300 ease-in-out ${
          isDark
            ? 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:shadow-xl hover:shadow-slate-900/50'
            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xl hover:shadow-slate-200/50'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <p className={`relative z-20 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
        <p className={`relative z-20 mt-2 text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <AnimatedNumber
            value={stat.value}
            prefix={stat.prefix ?? ''}
            suffix={stat.suffix ?? ''}
            decimals={stat.decimals ?? 0}
          />
        </p>
        <span
          className="pointer-events-none absolute -right-2 -top-2 z-20 h-16 w-16 rounded-full bg-blue-500/5 blur-xl transition-opacity duration-300 group-hover:bg-blue-500/10"
          style={{ transitionDelay: `${index * 40}ms` }}
        />
      </motion.div>
    </SpotlightCard>
  );
}

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Large indigo orb — top left, slow drift */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent blur-3xl"
      />
      {/* Emerald orb — right side, medium drift */}
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -25, 0], scale: [1, 1.1, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-1/4 -right-[8%] h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-transparent blur-3xl"
      />
      {/* Blue orb — bottom center, slow vertical */}
      <motion.div
        animate={{ y: [0, -35, 0], x: [0, -15, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-blue-400/15 via-cyan-400/10 to-transparent blur-3xl"
      />
      {/* Soft purple orb — mid left, gentle pulse */}
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, 10, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
        className="absolute top-1/2 -left-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-purple-400/10 via-pink-400/5 to-transparent blur-3xl"
      />
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      {/* Floating particles */}
      <motion.div
        animate={{ y: [0, -60, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-1/4 h-1.5 w-1.5 rounded-full bg-blue-400/40 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -40, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-40 right-1/3 h-1 w-1 rounded-full bg-emerald-400/40 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -50, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute bottom-32 left-1/2 h-1 w-1 rounded-full bg-indigo-400/40 blur-[1px]"
      />
    </div>
  );
}

export function Hero() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--section-mouse-x', `${x}px`);
    el.style.setProperty('--section-mouse-y', `${y}px`);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative"
      style={{ '--section-mouse-x': '50%', '--section-mouse-y': '50%' } as React.CSSProperties}
    >
      {/* Section-level spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at var(--section-mouse-x) var(--section-mouse-y), ${
            isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.05)'
          }, transparent 80%)`,
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 text-center md:pb-20 md:pt-28"
      >
        {/* Breathing glow badge */}
        <motion.div variants={item} className="mb-6 flex justify-center">
          <div className="relative inline-flex">
            <span className="animate-pulse-soft absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-cyan-500/30 blur-md" />
            <div className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm backdrop-blur ${
              isDark
                ? 'border-slate-700 bg-slate-900/80 text-slate-300'
                : 'border-slate-200 bg-white/80 text-slate-600'
            }`}>
              <Sparkles className="h-4 w-4 text-blue-500" />
              Trusted by growing businesses
              <Shield className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          variants={item}
          className={`mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Payroll. Done Right.
        </motion.h1>

        <motion.p variants={item} className={`mx-auto mt-6 max-w-2xl text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Simple, accurate, and organized payroll management built for growing businesses.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className={`group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium shadow-sm transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-white text-slate-900 hover:bg-slate-100 hover:shadow-md'
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
            }`}
          >
            Start Managing Payroll
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className={`inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-all active:scale-[0.98] ${
              isDark
                ? 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            See How It Works
          </a>
        </motion.div>

        {/* Analytics Stat Grid — 4 equal columns */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-16 grid grid-cols-1 items-stretch gap-4 md:grid-cols-4"
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}