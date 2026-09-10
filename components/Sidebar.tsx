'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/actions/auth-actions';
import {
  LayoutDashboard,
  Building2,
  Users,
  Banknote,
  FileText,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export interface SidebarProps {
  organizationName?: string;
  userRole?: string;
  enabledModules?: string[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  moduleId?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'PEOPLE & ENTITIES',
    items: [
      { href: '/app/businesses', label: 'Businesses', icon: Building2, moduleId: 'businesses' },
      { href: '/app/employees',  label: 'Employees',  icon: Users, moduleId: 'employees' },
    ],
  },
  {
    label: 'PAYROLL WORKFLOW',
    items: [
      { href: '/app/payroll',  label: 'Payroll Runs',      icon: Banknote, moduleId: 'payroll' },
      { href: '/app/payslips', label: 'Payslips',          icon: FileText, moduleId: 'payroll' },
      { href: '/app/history',  label: 'Disbursal History', icon: History, moduleId: 'payroll' },
    ],
  },
  {
    label: 'COMPLIANCE & AUDIT',
    items: [
      { href: '/app/reports', label: 'Statutory Reports', icon: BarChart3, moduleId: 'reports' },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { href: '/app/settings', label: 'System Settings', icon: Settings, moduleId: 'settings' },
    ],
  },
];

export function Sidebar({
  organizationName = 'Acme Holdings (PH)',
  userRole = 'Administrator',
  enabledModules = ['payroll', 'employees', 'businesses', 'reports', 'settings'],
}: SidebarProps) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Live Philippine Standard Time clock (UTC+8)
  useEffect(() => {
    function updatePstTime() {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('en-PH', {
          timeZone: 'Asia/Manila',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now);
        setCurrentTime(timeStr);
      } catch {
        setCurrentTime('PST GMT+8');
      }
    }
    updatePstTime();
    const interval = setInterval(updatePstTime, 1000);
    return () => clearInterval(interval);
  }, []);

  function isActive(href: string) {
    return pathname === href || (href !== '/app' && pathname.startsWith(href));
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      <div>
        {/* ── Brand Header ── */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between">
            <Link href="/app" className="flex items-center gap-3 group">
              <div
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  boxShadow: '0 0 16px var(--accent-glow)',
                }}
              >
                <Banknote className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white dark:ring-[#121713]" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold tracking-tight font-sans text-[var(--text-primary)]">
                    ShinPay+
                  </p>
                  <span className="rounded px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border)]">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                  Workforce OS
                </p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border)]"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Organization Switcher Pill */}
          <div
            className="mt-4 flex items-center justify-between rounded-xl px-3 py-2 border transition-all duration-150"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="min-w-0 flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: 'var(--accent)' }}
              />
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                  {organizationName}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] capitalize">
                  {userRole}
                </p>
              </div>
            </div>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          </div>
        </div>

        {/* ── Navigation Links ── */}
        <nav className="px-3 py-2 space-y-5">
          {NAV_GROUPS.map((group) => ({
            ...group,
            items: group.items.filter(
              (item) => !item.moduleId || enabledModules.includes(item.moduleId)
            ),
          }))
            .filter((group) => group.items.length > 0)
            .map((group) => (
            <div key={group.label}>
              <p
                className="mb-1.5 px-3 text-[10px] font-semibold tracking-wider uppercase select-none text-[var(--text-muted)]"
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150"
                      style={
                        active
                          ? {
                              background: 'var(--accent-subtle)',
                              color: 'var(--accent-hover)',
                              fontWeight: 600,
                            }
                          : {
                              color: 'var(--text-secondary)',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'var(--border)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = '';
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {/* Left glowing accent indicator on active */}
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                          style={{
                            background: 'var(--accent)',
                            boxShadow: '0 0 8px var(--accent-glow)',
                          }}
                        />
                      )}

                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110"
                          style={{
                            color: active ? 'var(--accent)' : 'inherit',
                          }}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {active && (
                        <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Footer Widgets & Sign Out ── */}
      <div className="p-3 space-y-3">
        {/* Live Philippine Standard Time & Compliance Pill */}
        <div
          className="rounded-xl p-3 border space-y-2 text-xs"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>Manila Time</span>
            </span>
            <span className="font-mono font-semibold text-[var(--text-primary)]">
              {currentTime || '08:00 AM'}
            </span>
          </div>

          <div
            className="flex items-center justify-between rounded-lg px-2 py-1 text-[10px]"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>2024 Statutory Triad</span>
            </span>
            <span className="font-bold">₱30k MSC Cap</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => startTransition(() => logoutAction())}
          disabled={pending}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 disabled:opacity-50 text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{pending ? 'Signing out…' : 'Sign out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Drawer Trigger Bar (Visible only on mobile) ── */}
      <div
        className="no-print md:hidden sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--border)]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs font-semibold">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Banknote className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">ShinPay+</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono text-[var(--text-muted)]">PH</span>
        </div>
      </div>

      {/* ── Desktop Docked Sidebar ── */}
      <aside
        className="no-print hidden md:flex w-64 shrink-0 flex-col border-r h-screen sticky top-0 z-20 transition-colors duration-200"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Slide-out Drawer ── */}
      {mobileOpen && (
        <div className="no-print md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="relative flex w-72 max-w-xs flex-1 flex-col border-r shadow-2xl transition-transform"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}