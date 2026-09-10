'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createOrganizationAction } from '@/lib/actions/auth-actions';
import { FormError } from '@/components/ui';
import {
  Building2,
  Briefcase,
  Globe,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Retail',
  'Pharmacy',
  'Restaurant',
  'Transportation',
  'Automotive',
  'Water Station',
  'Office',
  'Manufacturing',
  'Services',
  'Other',
];

export default function OrganizationSetupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState({
    name: '',
    business_type: '',
    country: 'Philippines',
    address: '',
    contact_number: '',
    email: '',
  });

  function set(name: keyof typeof v) {
    return (value: string) => setV((prev) => ({ ...prev, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createOrganizationAction(v);
      if (res && !res.ok) setError(res.error || 'Could not create organization.');
    });
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-2xl backdrop-blur-2xl"
      style={{
        background: 'rgba(16, 22, 18, 0.88)',
        borderColor: 'rgba(135, 162, 133, 0.22)',
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(135, 162, 133, 0.12), 0 0 40px rgba(83, 108, 81, 0.15)',
      }}
    >
      {/* ── Top Accent Highlight Bar ── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sage-500 via-emerald-500 to-sage-400" />

      <div className="p-8 sm:p-10">
        {/* ── Step Progress Indicator ── */}
        <div className="mb-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-500/30 bg-sage-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage-300">
            <Sparkles className="h-3 w-3" /> Step 1 of 2
          </span>
          <span className="text-xs font-medium text-slate-400">
            Initial Workspace Setup
          </span>
        </div>

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Register your organization
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Create your central organization profile to configure multi-business operations and employee records.
          </p>
        </div>

        {/* ── Setup Form ── */}
        <form onSubmit={submit} className="space-y-5">
          {/* Organization Name */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              htmlFor="name"
            >
              Organization Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Building2 className="h-4 w-4" />
              </div>
              <input
                id="name"
                className="input pl-10 h-11"
                value={v.name}
                onChange={(e) => set('name')(e.target.value)}
                placeholder="e.g. Acme Corporation or Global Holdings"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Business Type & Country */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
                htmlFor="business_type"
              >
                Primary Industry
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  id="business_type"
                  className="input pl-10 h-11 appearance-none pr-8 cursor-pointer"
                  value={v.business_type}
                  onChange={(e) => set('business_type')(e.target.value)}
                >
                  <option value="" className="bg-[#12151a] text-slate-400">
                    Select industry…
                  </option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#12151a] text-white">
                      {t}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
                htmlFor="country"
              >
                Country / Region
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Globe className="h-4 w-4" />
                </div>
                <input
                  id="country"
                  className="input pl-10 h-11"
                  value={v.country}
                  onChange={(e) => set('country')(e.target.value)}
                  placeholder="Philippines"
                />
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              htmlFor="address"
            >
              Principal Office Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                id="address"
                className="input pl-10 h-11"
                value={v.address}
                onChange={(e) => set('address')(e.target.value)}
                placeholder="Suite, building, street, city, province"
              />
            </div>
          </div>

          {/* Contact Number & Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
                htmlFor="contact_number"
              >
                Contact Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="contact_number"
                  className="input pl-10 h-11"
                  value={v.contact_number}
                  onChange={(e) => set('contact_number')(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
                htmlFor="email"
              >
                Official Business Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="input pl-10 h-11"
                  value={v.email}
                  onChange={(e) => set('email')(e.target.value)}
                  placeholder="admin@company.ph"
                />
              </div>
            </div>
          </div>

          <FormError error={error} />

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full h-12 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg"
            style={{
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
            }}
            disabled={pending}
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Initializing Workspace…
              </span>
            ) : (
              <>
                Complete Setup &amp; Proceed
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* ── Reassurance Footer ── */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Multi-tenant encrypted database</span>
          </div>

          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}