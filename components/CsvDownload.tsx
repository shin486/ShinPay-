'use client';

import { useTransition } from 'react';

/** Client component that calls a CSV-producing server action and downloads the result. */
export function CsvDownload({
  action,
  label,
  className,
  icon,
}: {
  action: () => Promise<{ ok: boolean; csv?: string; filename?: string; error?: string }>;
  label: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  function download() {
    startTransition(async () => {
      const res = await action();
      if (!res.ok || !res.csv) return;
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || 'export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <button type="button" className={className || 'btn-secondary'} onClick={download} disabled={pending}>
      {icon}
      {pending ? 'Exporting…' : label}
    </button>
  );
}