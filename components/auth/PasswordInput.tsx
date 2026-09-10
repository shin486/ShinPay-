'use client';

import React, { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string | null;
  hint?: string;
  rightAction?: React.ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, rightAction, id, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (props.name ? `auth-input-${props.name}` : undefined);

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-200"
          >
            {label}
            {props.required && <span className="text-emerald-400 ml-1" aria-hidden="true">*</span>}
          </label>
          {rightAction && <div>{rightAction}</div>}
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>

          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`block w-full rounded-xl pl-10 pr-11 py-2.5 text-sm font-normal text-slate-100 placeholder:text-slate-400
              transition-all duration-150 outline-none
              ${error ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25'}
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            style={{
              background: 'rgba(20, 28, 22, 0.75)',
              border: error ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(135, 162, 133, 0.25)',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.25)',
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {error ? (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1"
          >
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
