import type { Metadata } from 'next';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';

export const metadata: Metadata = {
  title: 'ShinPay+ — Commercial Payroll SaaS Platform',
  description: 'Enterprise payroll management simplified for growing businesses and organizations.',
};

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0c100d] text-slate-100 flex">
      {/* Dynamic ambient background matching ShinPay+ landing design */}
      <AuthBackground />

      {/* ── Left Side: Brand & Commercial SaaS Showcase Panel (Desktop) ── */}
      <AuthBrandPanel />

      {/* ── Right Side: Centered Auth Form Panel (Responsive) ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen overflow-y-auto">
        <div className="w-full max-w-[460px] my-auto py-6">
          {children}
        </div>
      </div>
    </div>
  );
}