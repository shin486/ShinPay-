'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface AuthCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export function AuthCheckbox({
  label,
  id,
  className = '',
  checked,
  defaultChecked,
  onChange,
  ...props
}: AuthCheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState<boolean>(
    Boolean(defaultChecked ?? checked ?? false)
  );

  const isChecked = checked !== undefined ? checked : internalChecked;

  const checkboxId = id || (props.name ? `auth-checkbox-${props.name}` : undefined);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (checked === undefined) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group text-xs text-slate-300 hover:text-slate-100 transition-colors ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          id={checkboxId}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`h-4 w-4 rounded border transition-all duration-150 flex items-center justify-center
            ${isChecked ? 'bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-[#15181E] border-white/20 group-hover:border-white/40'}
            peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[#0c100d]
          `}
        >
          {isChecked && (
            <Check className="h-3 w-3 text-white stroke-[3]" aria-hidden="true" />
          )}
        </div>
      </div>
      <span className="leading-none">{label}</span>
    </label>
  );
}
