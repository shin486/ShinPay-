'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployeeAction, updateEmployeeAction, type ActionResult } from '@/lib/actions/employee-actions';
import { FormError } from '@/components/ui';

const EMPLOYMENT_STATUSES = ['Regular', 'Probationary', 'Contractual', 'Part-Time', 'Other'];
const SALARY_TYPES = ['monthly', 'daily', 'hourly'];
const PAYROLL_FREQUENCIES = ['monthly', 'semi-monthly', 'bi-weekly', 'weekly'];

export interface EmployeeInitial {
  employee_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  date_of_birth?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  business_id?: string | number;
  position?: string;
  employment_status?: string;
  date_hired?: string;
}

export function EmployeeForm({
  businesses,
  employeeId,
  initial,
  showSalary = true,
}: {
  businesses: { id: number; name: string }[];
  employeeId?: number;
  initial?: EmployeeInitial;
  showSalary?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState({
    employee_id: initial?.employee_id || '',
    first_name: initial?.first_name || '',
    middle_name: initial?.middle_name || '',
    last_name: initial?.last_name || '',
    suffix: initial?.suffix || '',
    date_of_birth: initial?.date_of_birth || '',
    contact_number: initial?.contact_number || '',
    email: initial?.email || '',
    address: initial?.address || '',
    business_id: String(initial?.business_id ?? ''),
    position: initial?.position || '',
    employment_status: initial?.employment_status || 'Regular',
    date_hired: initial?.date_hired || '',
    salary_type: 'monthly',
    basic_rate: '',
    payroll_frequency: 'semi-monthly',
    effective_date: '',
  });

  function set(name: keyof typeof v) {
    return (value: string) => setV((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      employee_id: v.employee_id,
      first_name: v.first_name,
      middle_name: v.middle_name,
      last_name: v.last_name,
      suffix: v.suffix,
      date_of_birth: v.date_of_birth || undefined,
      contact_number: v.contact_number || undefined,
      email: v.email || undefined,
      address: v.address || undefined,
      business_id: v.business_id,
      position: v.position || undefined,
      employment_status: v.employment_status,
      date_hired: v.date_hired || undefined,
      salary_type: v.salary_type,
      basic_rate: v.basic_rate,
      payroll_frequency: v.payroll_frequency,
      effective_date: v.effective_date || undefined,
    };
    const res: ActionResult = employeeId
      ? await updateEmployeeAction(employeeId, payload)
      : await createEmployeeAction(payload);
    if (res.ok) router.push(`/app/employees/${res.id || employeeId}`);
    else setError(res.error || 'Something went wrong.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Personal Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Field label="Employee ID"><input className="input" value={v.employee_id} onChange={(e) => set('employee_id')(e.target.value)} required placeholder="e.g. EMP-001" /></Field>
          <Field label="First Name"><input className="input" value={v.first_name} onChange={(e) => set('first_name')(e.target.value)} required /></Field>
          <Field label="Middle Name"><input className="input" value={v.middle_name} onChange={(e) => set('middle_name')(e.target.value)} /></Field>
          <Field label="Last Name"><input className="input" value={v.last_name} onChange={(e) => set('last_name')(e.target.value)} required /></Field>
          <Field label="Suffix"><input className="input" value={v.suffix} onChange={(e) => set('suffix')(e.target.value)} placeholder="Jr., III" /></Field>
          <Field label="Date of Birth"><input type="date" className="input" value={v.date_of_birth} onChange={(e) => set('date_of_birth')(e.target.value)} /></Field>
          <Field label="Contact Number"><input className="input" value={v.contact_number} onChange={(e) => set('contact_number')(e.target.value)} /></Field>
          <Field label="Email Address"><input type="email" className="input" value={v.email} onChange={(e) => set('email')(e.target.value)} /></Field>
        </div>
        <Field label="Address">
          <textarea className="input" rows={2} value={v.address} onChange={(e) => set('address')(e.target.value)} />
        </Field>
      </Section>

      <Section title="Employment Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Field label="Business">
            <select className="input" value={v.business_id} onChange={(e) => set('business_id')(e.target.value)} required>
              <option value="">Select business…</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>) }
            </select>
          </Field>
          <Field label="Position"><input className="input" value={v.position} onChange={(e) => set('position')(e.target.value)} /></Field>
          <Field label="Employment Status">
            <select className="input" value={v.employment_status} onChange={(e) => set('employment_status')(e.target.value)}>
              {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>) }
            </select>
          </Field>
          <Field label="Date Hired"><input type="date" className="input" value={v.date_hired} onChange={(e) => set('date_hired')(e.target.value)} /></Field>
        </div>
      </Section>

      {showSalary && (
        <Section title="Salary Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Field label="Salary Type">
              <select className="input" value={v.salary_type} onChange={(e) => set('salary_type')(e.target.value)}>
                {SALARY_TYPES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>) }
              </select>
            </Field>
            <Field label="Basic Salary / Rate">
              <input type="number" min="0" step="0.01" className="input" value={v.basic_rate} onChange={(e) => set('basic_rate')(e.target.value)} required placeholder="0.00" />
            </Field>
            <Field label="Payroll Frequency">
              <select className="input" value={v.payroll_frequency} onChange={(e) => set('payroll_frequency')(e.target.value)}>
                {PAYROLL_FREQUENCIES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>) }
              </select>
            </Field>
            <Field label="Effective Date"><input type="date" className="input" value={v.effective_date} onChange={(e) => set('effective_date')(e.target.value)} /></Field>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Monthly employees are pro-rated to the payroll frequency. Daily/hourly employees use working days in the period.
          </p>
        </Section>
      )}

      <FormError error={error} />
      <div className="flex justify-end gap-2 pb-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : employeeId ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-5">
      <h3 className="mb-3.5 text-sm font-bold text-[var(--text-primary)]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}