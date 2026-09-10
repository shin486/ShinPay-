'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  showMobileLogo?: boolean;
}

export function AuthHeader({
  title,
  subtitle,
  badge,
  showMobileLogo = true,
}: AuthHeaderProps) {
  return (
    <div className="mb-7">
      {/* Mobile/Compact Logo Header */}
      {showMobileLogo && (
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #6a8668 0%, #435641 100%)',
                boxShadow: '0 0 16px rgba(83, 108, 81, 0.4)',
              }}
            >
              <Zap className="h-4 w-4 text-white fill-white" strokeWidth={0} />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                ShinPay+
              </span>
              <span className="text-[10px] block text-sage-300 font-medium -mt-0.5 uppercase tracking-wider">
                Workforce OS
              </span>
            </div>
          </Link>
          {badge && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sage-200 border border-sage-500/30"
              style={{ background: 'rgba(83, 108, 81, 0.20)' }}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Desktop Badge if provided */}
      {badge && (
        <div className="hidden lg:block mb-3">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sage-200 border border-sage-500/30"
            style={{ background: 'rgba(83, 108, 81, 0.20)' }}
          >
            {badge}
          </span>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {subtitle}
      </p>
    </div>
  );
}
