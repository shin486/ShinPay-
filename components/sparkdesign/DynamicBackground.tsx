'use client';

import { useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

export function DynamicBackground() {
  const { scrollY } = useScroll();

  // Multi-plane parallax depth on scroll (GPU composited)
  const orbY1 = useTransform(scrollY, [0, 4000], [0, -380]);
  const orbY2 = useTransform(scrollY, [0, 4000], [0, 320]);
  const orbY3 = useTransform(scrollY, [0, 4000], [0, -220]);
  const orbY4 = useTransform(scrollY, [0, 4000], [0, 240]);
  const chipsY = useTransform(scrollY, [0, 4000], [0, -750]);

  // Cursor Flashlight Coordinates
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Layer 1: Cursor Flashlight Specular Glow */}
      <motion.div
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
        }}
        className="fixed h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(83,108,81,0.24)_0%,rgba(16,185,129,0.10)_40%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(135,162,133,0.18)_0%,rgba(16,185,129,0.08)_40%,transparent_70%)] blur-2xl pointer-events-none"
      />

      {/* Layer 2: Tactile Architectural Blueprint Dot Grid (faded at edges with radial mask) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(83,108,81,0.22)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(rgba(135,162,133,0.20)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-85 dark:opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 95%)',
        }}
      />

      {/* Layer 3: Dynamic Fluid Sage Aurora Orbs */}
      {/* Orb A: Top-Left Soft Sage & Emerald Bloom */}
      <motion.div
        style={{ y: orbY1 }}
        animate={{
          scale: [1, 1.15, 0.94, 1],
          x: [0, 45, -30, 0],
          rotate: [0, 12, -8, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-28 -left-20 h-[640px] w-[640px] rounded-full bg-gradient-to-br from-sage-400/55 via-emerald-400/35 to-transparent dark:from-sage-700/35 dark:via-emerald-900/30 dark:to-transparent blur-[90px]"
      />

      {/* Orb B: Mid-Right Warm Amber-Sage Sunlight Accent */}
      <motion.div
        style={{ y: orbY2 }}
        animate={{
          scale: [1, 1.12, 0.92, 1],
          x: [0, -50, 30, 0],
          rotate: [0, -14, 10, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-1/4 -right-28 h-[580px] w-[580px] rounded-full bg-gradient-to-tl from-amber-300/40 via-sage-300/35 to-transparent dark:from-amber-900/25 dark:via-sage-800/25 dark:to-transparent blur-[100px]"
      />

      {/* Orb C: Center Ambient Mint Mist */}
      <motion.div
        style={{ y: orbY3 }}
        animate={{
          scale: [0.92, 1.12, 0.92],
          x: [0, 35, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-1/2 left-1/4 h-[520px] w-[520px] rounded-full bg-emerald-300/40 dark:bg-emerald-900/30 blur-[110px]"
      />

      {/* Orb D: Lower Emerald Harbor */}
      <motion.div
        style={{ y: orbY4 }}
        animate={{
          scale: [1, 1.14, 1],
          x: [0, -40, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 -left-20 h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-emerald-400/45 via-sage-300/35 to-transparent dark:from-emerald-900/35 dark:via-sage-800/25 dark:to-transparent blur-[95px]"
      />

      {/* Layer 4: Floating Kinetic Compliance Chips in Outer Margins (Wide Screens Only) */}
      <div className="hidden 2xl:block">
        {/* Left Margin Chips */}
        <motion.div
          style={{ y: chipsY }}
          className="absolute left-8 top-1/3 flex flex-col gap-8 opacity-65 dark:opacity-40 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-2, 1, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 rounded-2xl border border-sage-200/70 dark:border-sage-800/60 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-sm text-[11px] font-mono font-bold text-sage-800 dark:text-sage-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>✦ RA 10963 TRAIN</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0], rotate: [1, -2, 1] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="flex items-center gap-2 rounded-2xl border border-sage-200/70 dark:border-sage-800/60 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-sm text-[11px] font-mono font-bold text-sage-800 dark:text-sage-200 ml-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
            <span>₱30k MSC SSS Cap</span>
          </motion.div>
        </motion.div>

        {/* Right Margin Chips */}
        <motion.div
          style={{ y: chipsY }}
          className="absolute right-8 top-1/2 flex flex-col gap-9 opacity-65 dark:opacity-40 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [2, -1, 2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="flex items-center gap-2 rounded-2xl border border-sage-200/70 dark:border-sage-800/60 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-sm text-[11px] font-mono font-bold text-sage-800 dark:text-sage-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>DOLE 125% OT Standard</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0], rotate: [-1, 2, -1] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="flex items-center gap-2 rounded-2xl border border-sage-200/70 dark:border-sage-800/60 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-sm text-[11px] font-mono font-bold text-sage-800 dark:text-sage-200 mr-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>✓ PESONet Direct Batch</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

