'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AuthAlertProps {
  type?: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message?: string | null;
  className?: string;
}

export function AuthAlert({
  type = 'error',
  title,
  message,
  className = '',
}: AuthAlertProps) {
  if (!message && !title) return null;

  const config = {
    error: {
      containerBg: 'rgba(239, 68, 68, 0.12)',
      containerBorder: 'rgba(239, 68, 68, 0.28)',
      icon: <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: '#FCA5A5',
      messageColor: '#FECACA',
      defaultTitle: 'Unable to proceed',
    },
    success: {
      containerBg: 'rgba(34, 197, 94, 0.12)',
      containerBorder: 'rgba(34, 197, 94, 0.28)',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: '#86EFAC',
      messageColor: '#BBF7D0',
      defaultTitle: 'Success',
    },
    info: {
      containerBg: 'rgba(59, 130, 246, 0.12)',
      containerBorder: 'rgba(59, 130, 246, 0.28)',
      icon: <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: '#93C5FD',
      messageColor: '#BFDBFE',
      defaultTitle: 'Notice',
    },
    warning: {
      containerBg: 'rgba(245, 158, 11, 0.12)',
      containerBorder: 'rgba(245, 158, 11, 0.28)',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: '#FDE68A',
      messageColor: '#FEF3C7',
      defaultTitle: 'Warning',
    },
  }[type];

  const displayTitle = title || (type === 'error' ? config.defaultTitle : undefined);

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 transition-all duration-200 ${className}`}
      style={{
        background: config.containerBg,
        borderColor: config.containerBorder,
      }}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="min-w-0 flex-1">
          {displayTitle && (
            <p
              className="text-sm font-semibold leading-snug"
              style={{ color: config.titleColor }}
            >
              {displayTitle}
            </p>
          )}
          {message && (
            <p
              className={`text-xs leading-relaxed ${displayTitle ? 'mt-1' : ''}`}
              style={{ color: config.messageColor }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
