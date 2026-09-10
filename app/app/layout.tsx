import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeProvider';
import { AnimatedBackground } from '@/components/Animated';
import { getEnabledModuleIdsAsync } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=' + encodeURIComponent('/app'));
  if (user.organization_id === null || user.organization_id === undefined)
    redirect('/organization/setup');

  const enabledModules = await getEnabledModuleIdsAsync(user.organization_id);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const initials = (user.full_name || user.display_name).charAt(0).toUpperCase();
  const displayName = user.full_name || user.display_name;
  const role = user.organization_role || user.role;

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* ── Animated ambient background (dark mode only, hidden in light) ── */}
      <div className="hidden dark:block">
        <AnimatedBackground />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar
        organizationName={user.organization_name || 'Acme Holdings'}
        userRole={role || 'Administrator'}
        enabledModules={enabledModules}
      />

      {/* ── Main column ── */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* ── Top Header ── */}
        <header
          className="no-print sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Left: greeting & statutory compliance indicator */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {greeting},{' '}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{displayName}</span>
              </p>
            </div>

            <div
              className="hidden lg:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border"
              style={{
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>2024 SSS & PhilHealth Compliant</span>
            </div>
          </div>

          {/* Right: quick search preview + setup + theme toggle + avatar */}
          <div className="flex items-center gap-3">
            {/* Quick search button shortcut */}
            <Link
              href="/app/employees"
              className="hidden md:flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs border transition-colors"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Quick search…</span>
              <kbd className="rounded border px-1 py-0.2 text-[10px] font-mono" style={{ borderColor: 'var(--border)' }}>
                Ctrl+K
              </kbd>
            </Link>

            <Link
              href="/onboarding"
              className="hidden text-xs sm:block transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Setup
            </Link>

            <ThemeToggle />

            {/* Avatar + name */}
            <div className="flex items-center gap-2.5 pl-1">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  boxShadow: '0 0 0 2px var(--accent-glow)',
                }}
              >
                {initials}
              </div>
              <div className="hidden leading-tight sm:block text-left">
                <p className="text-sm font-semibold truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                  {role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}