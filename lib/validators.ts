/** Lightweight validation helpers returning error messages (or null when valid). */

export function required(
  v: string | number | null | undefined,
  label = 'This field'
): string | null {
  if (v == null || String(v).trim() === '') return `${label} is required.`;
  return null;
}

export function positiveNumber(
  v: string | number | null | undefined,
  label = 'Amount',
  allowZero = false
): string | null {
  if (v == null || String(v).trim() === '') return `${label} is required.`;
  const num = Number(v);
  if (isNaN(num)) return `${label} must be a valid number.`;
  if (num < 0 || (!allowZero && num === 0)) {
    return allowZero ? `${label} cannot be negative.` : `${label} must be greater than zero.`;
  }
  return null;
}

export function notNegative(v: string | number | null | undefined, label = 'Value'): string | null {
  if (v == null || String(v).trim() === '') return null;
  const num = Number(v);
  if (isNaN(num)) return `${label} must be a valid number.`;
  if (num < 0) return `${label} cannot be negative.`;
  return null;
}

export function dateRange(start: string, end: string): string | null {
  if (!start || !end) return 'Payroll period dates are required.';
  if (start > end) return 'Period start must be on or before period end.';
  return null;
}

export function isValidDate(v: string | null | undefined): boolean {
  return !!v && !isNaN(new Date(v).getTime());
}

/** Collect the first error from a list of validators. */
export function firstError(checks: Array<string | null>): string | null {
  for (const c of checks) if (c) return c;
  return null;
}