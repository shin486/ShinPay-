/** Formatting helpers shared across the app. */

export function formatMoney(value: unknown, symbol = '\u20B1'): string {
  const num = Number(value ?? 0);
  if (isNaN(num)) return `${symbol}0.00`;
  const neg = num < 0;
  const abs = Math.abs(num);
  return `${neg ? '-' : ''}${symbol}${abs.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: unknown): string {
  const num = Number(value ?? 0);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value: unknown): string {
  if (value == null || String(value) === '') return '—';
  const str = String(value);
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(value: unknown): string {
  if (value == null || String(value) === '') return '—';
  const str = String(value);
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(value: unknown): string {
  if (value == null || String(value) === '') return '—';
  const str = String(value);
  const d = new Date(str + (str.includes('T') ? '' : 'Z'));
  if (isNaN(d.getTime())) return str;
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const FREQUENCY_FACTORS: Record<string, number> = {
  monthly: 1,
  'semi-monthly': 2,
  'bi-weekly': 26,
  weekly: 52,
};

/**
 * Returns the divisor applied to a monthly figure to fit a given pay frequency.
 * A monthly amount of X paid semi-monthly is X / 2, bi-weekly is X / 26, etc.
 */
export function frequencyFactor(frequency: string): number {
  return FREQUENCY_FACTORS[frequency] ?? 1;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function fullName(emp: Record<string, unknown>): string {
  const parts = [String(emp.first_name ?? '')];
  if (emp.middle_name) parts.push(String(emp.middle_name));
  parts.push(String(emp.last_name ?? ''));
  const base = parts.filter(Boolean).join(' ');
  return emp.suffix ? `${base} ${String(emp.suffix)}` : base;
}

export function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-');
}

export function toTitleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}