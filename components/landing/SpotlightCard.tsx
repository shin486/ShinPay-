'use client';

import { useRef, useCallback, type ReactNode } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card wrapper that tracks cursor position and applies a radial spotlight glow.
 * Uses CSS custom properties for zero-render mouse tracking.
 */
export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative ${className}`}
      style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as React.CSSProperties}
    >
      {/* Spotlight glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${
            isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.07)'
          }, transparent 80%)`,
        }}
      />
      {/* Border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), ${
            isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)'
          }, transparent 70%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      {children}
    </div>
  );
}
