'use client';

import { motion } from 'framer-motion';
import { Landmark, ShieldCheck, Building, CheckCircle, Award, FileCheck2, CreditCard } from 'lucide-react';

interface PartnerBadge {
  name: string;
  code: string;
  type: string;
  tag?: string;
}

const BANKING_PARTNERS: PartnerBadge[] = [
  { name: 'BDO Unibank', code: 'BDO', type: 'Disbursement API / Auto-Credit', tag: 'Direct Host-to-Host' },
  { name: 'Bank of the Philippine Islands', code: 'BPI', type: 'BizLink Corporate Clearing', tag: 'Instant Batch' },
  { name: 'UnionBank of the Philippines', code: 'UBP', type: 'The Portal / MSME Payroll', tag: 'Real-time PESONet' },
  { name: 'Metrobank', code: 'MBT', type: 'Direct To Bank (DTB) Payroll', tag: 'Corporate Advice' },
  { name: 'Security Bank', code: 'SECB', type: 'DigiBanker Corporate Salary', tag: 'Automated Remit' },
  { name: 'Land Bank of the Philippines', code: 'LBP', type: 'weAccess Government & Private', tag: 'Official Depository' },
  { name: 'Rizal Commercial Banking Corp.', code: 'RCBC', type: 'RCBC Enterprise Disbursal', tag: 'Disbursement Hub' },
  { name: 'EastWest Bank', code: 'EWB', type: 'Cash Management Online Batch', tag: 'Payroll Services' },
];

const STATUTORY_INSTITUTIONS: PartnerBadge[] = [
  { name: 'Bureau of Internal Revenue', code: 'BIR', type: 'TRAIN Law / Form 1601-C & 2316', tag: 'Alphalist Compliant' },
  { name: 'Social Security System', code: 'SSS', type: 'Electronic R-3 & WISP Plus Filing', tag: '2024 MSC Ceiling' },
  { name: 'Philippine Health Insurance Corp.', code: 'PhilHealth', type: 'EPRS Direct Reporting & 5% Pool', tag: 'Universal Healthcare' },
  { name: 'Home Development Mutual Fund', code: 'Pag-IBIG', type: 'Electronic M1-1 & MP2 Auto-Remit', tag: '₱200 Cap Standard' },
  { name: 'Department of Labor and Employment', code: 'DOLE', type: 'General Labor Standards Compliance', tag: 'Handbook Verified' },
  { name: 'Department of Migrant Workers', code: 'DMW / POEA', type: 'OFW Overseas Remittance Protocols', tag: 'Standard Contract' },
  { name: 'Development Academy of the Philippines', code: 'DAP', type: 'Public Sector Compensation Index', tag: 'Statutory Benchmarked' },
];

export function IntegrationBadgeBar() {
  return (
    <section className="relative py-10 border-y border-sage-200/60 dark:border-sage-900/40 bg-sage-50/50 dark:bg-sage-950/30 overflow-hidden">
      {/* Edge Gradient Fade Masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#fafbfa] dark:from-[#0c100d] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#fafbfa] dark:from-[#0c100d] to-transparent z-10" />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <h3 className="text-sm uppercase tracking-widest font-bold text-slate-700 dark:text-slate-300 mb-2">
          Bank-Grade Disbursals & Statutory Alignments
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-2xl mx-auto">
          Built-in disbursement file formats for major Philippine commercial banks and 100% automated statutory reporting for national agencies.
        </p>
      </div>

      {/* Track A: Banking Partners (Left to Right / 38s with hover-pause) */}
      <div className="relative flex overflow-x-hidden py-1.5 group">
        <div className="animate-marquee-left hover-pause flex gap-3.5 shrink-0">
          {[...BANKING_PARTNERS, ...BANKING_PARTNERS].map((bank, idx) => (
            <div
              key={bank.code + idx}
              className="group/badge flex items-center gap-3 rounded-full border border-sage-200/70 dark:border-sage-800/60 bg-white/85 dark:bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-2xs hover:border-sage-400 dark:hover:border-sage-500 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all shrink-0 cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 group-hover/badge:bg-sage-600 group-hover/badge:text-white transition-colors">
                <Landmark className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                  {bank.name}
                </span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
                <span className="hidden sm:inline text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  {bank.type}
                </span>
              </div>
              {bank.tag && (
                <span className="rounded-full bg-sage-100/70 dark:bg-sage-900/50 px-2 py-0.5 text-[10px] font-mono text-sage-800 dark:text-sage-300 border border-sage-200/50 dark:border-sage-800/50">
                  {bank.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Track B: Statutory Agencies (Right to Left / 48s with hover-pause) */}
      <div className="relative flex overflow-x-hidden mt-3 py-1.5 group">
        <div className="animate-marquee-right hover-pause flex gap-3.5 shrink-0">
          {[...STATUTORY_INSTITUTIONS, ...STATUTORY_INSTITUTIONS].reverse().map((inst, idx) => (
            <div
              key={inst.code + '-stat-' + idx}
              className="group/badge flex items-center gap-3 rounded-full border border-sage-200/70 dark:border-sage-800/60 bg-white/85 dark:bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all shrink-0 cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover/badge:bg-emerald-600 group-hover/badge:text-white transition-colors">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                  {inst.name}
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                  {inst.code}
                </span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
                <span className="hidden sm:inline text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  {inst.type}
                </span>
              </div>
              {inst.tag && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                  {inst.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

