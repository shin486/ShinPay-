'use client';

import { useRouter } from 'next/navigation';

export function PayslipSelector({
  payrolls,
  selectedId,
}: {
  payrolls: { id: number; label: string }[];
  selectedId: number;
}) {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl">
      <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
        Select Finalized Payroll Run
      </label>
      <select
        className="input w-full"
        value={selectedId || ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            router.push(`/app/payslips?payroll=${val}`);
          } else {
            router.push('/app/payslips');
          }
        }}
      >
        <option value="">Choose a finalized payroll cut-off…</option>
        {payrolls.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}

