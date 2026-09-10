'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from './Navbar';
import { useTheme } from '@/components/ThemeProvider';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function About() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <section id="about" className={`border-t py-20 ${
      isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>About ShinPay+</h2>
        <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          ShinPay+ represents a commitment to making payroll accurate, reliable, organized, and easy
          to manage. Built for small and growing businesses, our platform helps you handle employee
          compensation with confidence.
        </p>
        <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Whether you run a single shop or manage multiple businesses, ShinPay+ scales with you.
        </p>
      </motion.div>
    </section>
  );
}

export function Footer() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <footer className={`border-t py-12 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <div className={`flex gap-6 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <a href="#features" className={`transition-colors ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-800'}`}>Features</a>
            <a href="#pricing" className={`transition-colors ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-800'}`}>Pricing</a>
            <a href="#about" className={`transition-colors ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-800'}`}>About</a>
            <Link href="/login" className={`transition-colors ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-800'}`}>Sign In</Link>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            &copy; {new Date().getFullYear()} ShinPay+. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}