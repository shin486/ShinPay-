'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Sun, Moon, Pause, Play, Menu, X, ArrowUpRight, Banknote } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#features', label: 'Capabilities' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#library', label: 'Rules' },
  { href: '#pricing', label: 'Plans' },
];

export function Navbar() {
  const { resolved, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Reading Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shinpay-pause-anim') === 'true';
      setAnimationsPaused(saved);
      if (saved) {
        document.documentElement.classList.add('animations-paused');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleAnimations = () => {
    const next = !animationsPaused;
    setAnimationsPaused(next);
    if (next) {
      document.documentElement.classList.add('animations-paused');
    } else {
      document.documentElement.classList.remove('animations-paused');
    }
    try {
      localStorage.setItem('shinpay-pause-anim', String(next));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = NAV_LINKS.map((link) => link.href.replace('#', ''));
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = resolved === 'dark';

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 mx-auto w-fit max-w-[95vw] z-50 transition-transform duration-300">
      <motion.div
        animate={{
          scale: scrolled ? 0.97 : 1,
          y: scrolled ? 2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative overflow-hidden flex items-center gap-1.5 sm:gap-2.5 rounded-full border border-sage-200/90 dark:border-sage-800/80 bg-white/90 dark:bg-[#0c100d]/90 backdrop-blur-2xl px-2.5 sm:px-3.5 py-1.5 shadow-xl shadow-sage-950/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/5"
      >
        {/* Left: Live Regulatory Compliance Pulse Chip */}
        <div className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-sage-50/90 dark:bg-sage-950/80 border border-sage-200/80 dark:border-sage-800/80 text-[11px] font-semibold text-sage-800 dark:text-sage-200 shrink-0 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] tracking-tight uppercase font-bold text-emerald-800 dark:text-emerald-300">
            2024 TRAIN Active
          </span>
        </div>

        {/* Center: Curated Navigation Links with Magnetic Pill */}
        <nav className="hidden lg:flex items-center gap-0.5 px-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 ${
                  isActive
                    ? 'text-slate-950 dark:text-slate-50 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="floating-nav-pill"
                    className="absolute inset-0 rounded-full -z-10 bg-sage-100/90 dark:bg-sage-900/60 shadow-2xs border border-sage-200/70 dark:border-sage-700/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-sage-200 dark:bg-sage-800/80 mx-0.5" />

        {/* Right: Controls & Sandbox Action Button */}
        <div className="flex items-center gap-1.5">
          {/* Animation Pause Toggle */}
          <button
            type="button"
            onClick={toggleAnimations}
            title={animationsPaused ? 'Resume animations' : 'Pause animations'}
            aria-label={animationsPaused ? 'Resume animations' : 'Pause animations'}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-sage-200/80 dark:border-sage-800/70 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-sage-100/60 dark:hover:bg-sage-900/40 transition-colors cursor-pointer"
          >
            {animationsPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-sage-200/80 dark:border-sage-800/70 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-sage-100/60 dark:hover:bg-sage-900/40 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
          </button>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-2.5 py-1.5 rounded-full hover:bg-sage-100/60 dark:hover:bg-sage-900/40 transition-colors cursor-pointer"
          >
            Log In
          </Link>

          {/* Register Action Pill */}
          <Link
            href="/register"
            className="relative group inline-flex items-center gap-1 rounded-full bg-sage-600 hover:bg-sage-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:shadow-md hover:shadow-sage-600/25 active:scale-95 transition-all overflow-hidden cursor-pointer ml-0.5"
          >
            <span>Register</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-full border border-sage-200/80 dark:border-sage-800/70 text-slate-700 dark:text-slate-300 hover:bg-sage-100/60 dark:hover:bg-sage-900/40 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Scroll Reading Progress Glow Line */}
        <div className="absolute -bottom-[1px] left-5 right-5 h-[2px] overflow-hidden rounded-full pointer-events-none opacity-90">
          <motion.div
            style={{ scaleX, transformOrigin: 'left' }}
            className="h-full w-full bg-gradient-to-r from-sage-400 via-emerald-400 to-sage-600 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
          />
        </div>
      </motion.div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto mt-2 w-72 mx-auto rounded-3xl border border-sage-200/90 dark:border-sage-800/80 bg-white/95 dark:bg-[#0c100d]/95 backdrop-blur-2xl p-3 shadow-2xl ring-1 ring-black/5"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    activeSection === link.href.replace('#', '')
                      ? 'bg-sage-100 dark:bg-sage-900 text-slate-950 dark:text-slate-100 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 mt-1 border-t border-sage-100 dark:border-sage-900 flex flex-col gap-2 px-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    ● BIR 2024 Engine Active
                  </span>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                  >
                    Log In
                  </Link>
                </div>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1 w-full rounded-xl bg-sage-600 text-white py-2 text-xs font-bold shadow-sm"
                >
                  Register Now <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

