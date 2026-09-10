'use client';

import { useEffect, useState, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   AnimatedBackground
   A CSS-only subtle ambient background for the dark-mode dashboard.
   Uses pure CSS transforms + filter:blur — GPU-friendly, no JS loop.
   Respects prefers-reduced-motion by hiding orbs entirely.
   ───────────────────────────────────────────────────────────────── */
export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Orb 1 — soft sage, top-left */}
      <div
        className="animate-orb-1 absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(135,162,133,0.14) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Orb 2 — deep pine, center-right */}
      <div
        className="animate-orb-2 absolute top-1/3 -right-32 h-[640px] w-[640px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(83,108,81,0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '6s',
        }}
      />
      {/* Orb 3 — bright sage sheen, bottom-left */}
      <div
        className="animate-orb-3 absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(173,193,171,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '12s',
        }}
      />
      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FloatingOrbs — lightweight decorative orbs for landing / auth.
   ───────────────────────────────────────────────────────────────── */
export function FloatingOrbs({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="animate-float absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/8 to-transparent blur-3xl dark:from-blue-500/5" />
      <div
        className="animate-float-slow absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/8 to-transparent blur-3xl dark:from-indigo-500/5"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="animate-float absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-500/8 to-transparent blur-3xl dark:from-cyan-500/5"
        style={{ animationDelay: '4s' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   AnimatedNumber — counts up from 0 to `value` on first render.
   Uses requestAnimationFrame with easeOutCubic. Respects
   prefers-reduced-motion by jumping straight to the final value.
   ───────────────────────────────────────────────────────────────── */
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 900,
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const prev = useRef(0);

  useEffect(() => {
    if (started.current) {
      if (prev.current === value) return;
    }
    started.current = true;
    prev.current = value;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let raf = 0;
    const from = 0;
    const to = value;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const formatted = display.toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Reveal — Intersection Observer fade+slide on scroll into view.
   ───────────────────────────────────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}