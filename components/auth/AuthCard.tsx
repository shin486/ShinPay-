'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full max-w-[460px] mx-auto overflow-hidden rounded-3xl border shadow-2xl ${className}`}
      style={{
        background: 'rgba(16, 22, 18, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'rgba(135, 162, 133, 0.22)',
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(135, 162, 133, 0.12), 0 0 40px rgba(83, 108, 81, 0.15)',
      }}
    >
      {/* Subtle Top Accent Highlight Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-sage-500 via-emerald-400 to-sage-600 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />

      {/* Card Content */}
      <div className="p-6 sm:p-8 md:p-9">{children}</div>
    </motion.div>
  );
}
