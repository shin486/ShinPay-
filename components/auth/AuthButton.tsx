'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export function AuthButton({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText = 'Please wait…',
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: AuthButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  const baseStyles =
    'relative inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 select-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0c100d] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985] h-12 w-full px-5';

  const variants = {
    primary:
      'bg-gradient-to-r from-sage-600 via-emerald-600 to-sage-700 text-white hover:from-sage-500 hover:via-emerald-500 hover:to-sage-600 hover:shadow-lg hover:shadow-sage-600/30 focus:ring-sage-500 border border-emerald-400/25',
    secondary:
      'bg-[#141b16] text-slate-100 border border-sage-800/80 hover:bg-[#1a241d] hover:border-sage-700 focus:ring-sage-400',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 focus:ring-sage-500',
  };

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
          <span>{loadingText}</span>
        </span>
      ) : (
        <>
          <span>{children}</span>
          {icon && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
