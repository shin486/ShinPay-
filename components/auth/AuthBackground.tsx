'use client';

import React, { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * AuthBackground
 * Dynamic, tactile sage ambient background matching the ShinPay+ landing page design system.
 * Features:
 * - Interactive pointer-driven specular flashlight glow.
 * - Architectural blueprint dot matrix grid with radial fade.
 * - Multi-layered breathing Sage and Emerald aurora orbs.
 * - Floating kinetic statutory and security chips.
 */
export function AuthBackground() {
  const [mounted, setMounted] = React.useState(false);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 24 });

  useEffect(() => {
    setMounted(true);
    const handlePointerMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
      style={{ background: '#0c100d' }}
    >
      {/* Layer 1: Cursor Flashlight Specular Glow (Client only) */}
      {mounted && (
        <motion.div
          style={{
            left: springX,
            top: springY,
            x: '-50%',
            y: '-50%',
          }}
          className="fixed h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(135,162,133,0.18)_0%,rgba(16,185,129,0.08)_40%,transparent_70%)] blur-2xl pointer-events-none"
        />
      )}

      {/* Layer 2: Tactile Architectural Blueprint Dot Grid */}
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(135,162,133,0.20)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-70"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 95%)',
        }}
      />

      {/* Layer 3: Dynamic Fluid Sage Aurora Orbs */}
      {/* Orb A: Top-Left Soft Sage & Emerald Bloom */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.94, 1],
          x: [0, 45, -30, 0],
          rotate: [0, 12, -8, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-28 -left-20 h-[640px] w-[640px] rounded-full bg-gradient-to-br from-sage-700/35 via-emerald-900/30 to-transparent blur-[90px]"
      />

      {/* Orb B: Mid-Right Warm Amber-Sage Sunlight Accent */}
      <motion.div
        animate={{
          scale: [1, 1.12, 0.92, 1],
          x: [0, -50, 30, 0],
          rotate: [0, -14, 10, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-1/4 -right-28 h-[580px] w-[580px] rounded-full bg-gradient-to-tl from-amber-900/25 via-sage-800/25 to-transparent blur-[100px]"
      />

      {/* Orb C: Center Ambient Mint Mist */}
      <motion.div
        animate={{
          scale: [0.92, 1.12, 0.92],
          x: [0, 35, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-1/2 left-1/4 h-[520px] w-[520px] rounded-full bg-emerald-900/30 blur-[110px]"
      />

      {/* Orb D: Lower Emerald Harbor */}
      <motion.div
        animate={{
          scale: [1, 1.14, 1],
          x: [0, -40, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 -left-20 h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-emerald-900/35 via-sage-800/25 to-transparent blur-[95px]"
      />

      {/* Layer 4: Floating Kinetic Compliance Chips in Margins */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
        {/* Chip 1: Top-Right Compliance Status */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 right-16 flex items-center gap-2 rounded-full border border-sage-800/80 bg-sage-950/70 backdrop-blur-xl px-3.5 py-1.5 shadow-xl text-[11px] font-medium text-sage-200"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-300">
            2024 SSS &amp; PhilHealth Active
          </span>
        </motion.div>

        {/* Chip 2: Bottom-Left Deterministic Engine */}
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -1.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-14 left-16 flex items-center gap-2 rounded-full border border-sage-800/80 bg-sage-950/70 backdrop-blur-xl px-3.5 py-1.5 shadow-xl text-[11px] font-medium text-slate-300"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>100% Deterministic Engine</span>
        </motion.div>

        {/* Chip 3: Bottom-Right Isolation Security */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-16 right-20 flex items-center gap-2 rounded-full border border-sage-800/80 bg-sage-950/70 backdrop-blur-xl px-3.5 py-1.5 shadow-xl text-[11px] font-medium text-slate-300"
        >
          <Lock className="h-3.5 w-3.5 text-sage-400" />
          <span>Tenant Data Isolation</span>
        </motion.div>
      </div>

      {/* Layer 5: Radial Vignette Mask */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(12, 16, 13, 0.75) 100%)',
        }}
      />
    </div>
  );
}
