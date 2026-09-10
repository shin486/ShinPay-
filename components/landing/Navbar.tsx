'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
] as const;

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          inverted || isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
        }`}
      >
        <Zap className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <span
        className={`text-lg font-bold tracking-tight ${
          inverted || isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        ShinPay+
      </span>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState<boolean>(false);
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-30 border-b backdrop-blur ${
        isDark
          ? 'border-slate-800 bg-slate-950/90'
          : 'border-slate-100 bg-white/90'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`rounded-lg p-2 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            href="/login"
            className={`text-sm font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={`group inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`rounded-lg p-2 ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className={`rounded-lg p-1.5 ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className={`border-t px-6 py-4 md:hidden ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {link.label}
              </a>
            ))}
            <hr className={isDark ? 'border-slate-800' : 'border-slate-100'} />
            <Link href="/login" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Sign In
            </Link>
            <Link
              href="/register"
              className={`rounded-lg px-4 py-2 text-center text-sm font-medium ${
                isDark
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-900 text-white'
              }`}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}