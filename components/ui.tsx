import type { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────
   Badge — colored pill for status / labels
   Uses CSS variables for automatic dark/light mode support.
   All colors are bright enough to be readable on dark surfaces.
   ───────────────────────────────────────────────────────────────── */
const BADGE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  green:  { color: 'var(--success)', bg: 'var(--success-bg)', border: 'rgba(34, 197, 94, 0.25)' },
  red:    { color: 'var(--danger)',  bg: 'var(--danger-bg)',  border: 'rgba(239, 68, 68, 0.25)' },
  amber:  { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'rgba(245, 158, 11, 0.25)' },
  blue:   { color: 'var(--info)',    bg: 'var(--info-bg)',    border: 'rgba(83, 108, 81, 0.25)' },
  sage:   { color: 'var(--accent)',  bg: 'var(--accent-subtle)', border: 'var(--border)' },
  gray:   { color: 'var(--text-secondary)', bg: 'var(--surface-raised)', border: 'var(--border)' },
};

export function Badge({
  children,
  tone = 'gray',
}: {
  children: ReactNode;
  tone?: string;
}) {
  const s = BADGE_STYLES[tone] ?? BADGE_STYLES.gray;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-sm"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   StatusBadge — maps payroll status keys to readable labeled badges
   with subtle animated pulse chips.
   ───────────────────────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: string; pulse?: boolean }> = {
    active:      { label: 'Active',      tone: 'green', pulse: true },
    inactive:    { label: 'Inactive',    tone: 'gray' },
    draft:       { label: 'Draft',       tone: 'gray' },
    processing:  { label: 'Processing',  tone: 'blue',  pulse: true },
    calculated:  { label: 'Calculated',  tone: 'sage' },
    for_review:  { label: 'For Review',  tone: 'amber', pulse: true },
    finalized:   { label: 'Finalized',   tone: 'green' },
    cancelled:   { label: 'Cancelled',   tone: 'red' },
  };
  const entry = map[status] ?? { label: status, tone: 'gray' };
  return (
    <Badge tone={entry.tone}>
      {entry.pulse && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: entry.tone === 'green' ? 'var(--success)' : entry.tone === 'amber' ? 'var(--warning)' : 'var(--accent)',
          }}
        />
      )}
      {entry.label}
    </Badge>
  );
}

/* ─────────────────────────────────────────────────────────────────
   StatCard — KPI metric card with icon, value, label, subtitle
   ───────────────────────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="card card-hover flex h-full flex-col gap-4 p-5"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Icon */}
      {icon && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'var(--accent-subtle)',
            color: 'var(--accent-hover)',
          }}
        >
          {icon}
        </div>
      )}

      <div className="min-w-0">
        {/* Value */}
        <p
          className="text-3xl font-bold tracking-tight truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </p>
        {/* Label */}
        <p
          className="mt-1 text-sm font-medium truncate"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </p>
        {/* Subtitle */}
        {sub && (
          <p
            className="mt-0.5 truncate text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PageHeader — page title + optional subtitle + actions row
   ───────────────────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Card — content panel with optional header title + actions
   ───────────────────────────────────────────────────────────────── */
export function Card({
  title,
  actions,
  children,
  className = '',
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card flex h-full flex-col ${className}`}>
      {(title || actions) && (
        <div
          className="flex items-center justify-between gap-3 px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {title && (
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h3>
          )}
          {actions}
        </div>
      )}
      <div className="flex-1 px-5 py-4">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SectionHeader — smaller inline section titles
   ───────────────────────────────────────────────────────────────── */
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2
        className="text-base font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   EmptyState — professional empty placeholder
   ───────────────────────────────────────────────────────────────── */
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center"
      style={{
        borderColor: 'var(--border-hover)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Placeholder icon */}
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--border)' }}
      >
        <svg
          className="h-5 w-5"
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <p
        className="text-sm font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </p>
      {message && (
        <p
          className="mt-1 text-xs leading-relaxed max-w-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {message}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FormError — inline form-level error message
   ───────────────────────────────────────────────────────────────── */
export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm font-medium"
      style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
    >
      {error}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SkeletonCard — loading placeholder for stat cards
   ───────────────────────────────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card flex h-full flex-col gap-4 p-5">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="space-y-2">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded-lg" />
        <div className="skeleton h-3 w-20 rounded-lg" />
      </div>
    </div>
  );
}