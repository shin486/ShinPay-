'use client';

import { Printer } from 'lucide-react';

export function PrintButton({
  label = 'Print / Save PDF',
  className = 'btn-secondary',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.print()}
      title="Print or Save as PDF"
    >
      <Printer className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

