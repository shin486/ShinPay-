'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Calculator,
  Zap,
  Landmark,
  Building,
  Lock,
  ArrowUpRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { type PayrollDemoConfig, DEFAULT_DEMO_CONFIG } from './data';

function formatCurrency(amount: number, sym = '₱'): string {
  return `${sym}${Math.round(amount).toLocaleString('en-US')}`;
}

export function PhotographicHero({
  onCalculateDemo,
}: {
  onCalculateDemo?: (config: PayrollDemoConfig) => void;
}) {
  // Quick Payroll Estimator State (Left Column)
  const [employeeName, setEmployeeName] = useState(DEFAULT_DEMO_CONFIG.employeeName);
  const [position, setPosition] = useState(DEFAULT_DEMO_CONFIG.position);
  const [monthlySalary, setMonthlySalary] = useState(DEFAULT_DEMO_CONFIG.monthlySalary);
  const [frequency, setFrequency] = useState<'semi-monthly' | 'monthly'>(DEFAULT_DEMO_CONFIG.frequency);
  const [overtimeHours, setOvertimeHours] = useState(DEFAULT_DEMO_CONFIG.overtimeHours);
  const [allowances, setAllowances] = useState(DEFAULT_DEMO_CONFIG.allowances);

  // Command Console State (Right Column)
  const [consoleTab, setConsoleTab] = useState<'live' | 'statutory' | 'bank'>('live');
  const [isDisbursed, setIsDisbursed] = useState(false);
  const [stampHash, setStampHash] = useState('BPI-PESONET-849201-VERIFIED');

  // 3D Perspective Tilt Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 220, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 220, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Dynamic Philippine Payroll Calculations for Maria Santos (synced with Left Column)
  const divisor = frequency === 'semi-monthly' ? 2 : 1;
  const baseCutoff = monthlySalary / divisor;
  const hourlyRate = monthlySalary / (26 * 8); // DOLE standard 26 days * 8 hours
  const otPay = hourlyRate * 1.25 * overtimeHours; // DOLE 125% regular OT
  const allowanceCutoff = allowances / divisor;
  const mariaGross = baseCutoff + otPay + allowanceCutoff;

  // Statutory 2024 Deductions for Maria
  const mariaSssMonthly = Math.min(monthlySalary, 30000) * 0.045; // 4.5% capped at ₱30k MSC (₱1,350 max)
  const mariaSssCutoff = mariaSssMonthly / divisor;
  const mariaPhilMonthly = Math.min(monthlySalary * 0.025, 2500); // 2.5% EE share capped at ₱2,500
  const mariaPhilCutoff = mariaPhilMonthly / divisor;
  const mariaPagIbigCutoff = 200 / divisor; // ₱200/mo standard

  const mariaStatDeductions = mariaSssCutoff + mariaPhilCutoff + mariaPagIbigCutoff;

  // TRAIN Law Graduated Withholding Tax (Allowances treated as non-taxable de minimis)
  const mariaTaxableCutoff = Math.max(0, (baseCutoff + otPay) - mariaStatDeductions);
  const annualizedTaxable = mariaTaxableCutoff * (frequency === 'semi-monthly' ? 24 : 12);
  let annualTax = 0;
  if (annualizedTaxable > 250000 && annualizedTaxable <= 400000) {
    annualTax = (annualizedTaxable - 250000) * 0.15;
  } else if (annualizedTaxable > 400000 && annualizedTaxable <= 800000) {
    annualTax = 22500 + (annualizedTaxable - 400000) * 0.20;
  } else if (annualizedTaxable > 800000 && annualizedTaxable <= 2000000) {
    annualTax = 102500 + (annualizedTaxable - 800000) * 0.25;
  } else if (annualizedTaxable > 2000000) {
    annualTax = 402500 + (annualizedTaxable - 2000000) * 0.30;
  }
  const mariaWithholdingTax = annualTax / (frequency === 'semi-monthly' ? 24 : 12);
  const mariaTotalDeductions = mariaStatDeductions + mariaWithholdingTax;
  const mariaNet = Math.max(0, mariaGross - mariaTotalDeductions);

  // Employee 2: Juan Dela Cruz (Lead Dev, ₱75k monthly - demonstrating ₱30k MSC cap)
  const juanMonthly = 75000;
  const juanBase = juanMonthly / divisor;
  const juanGross = juanBase;
  const juanSss = (30000 * 0.045) / divisor; // Capped at ₱30k MSC -> ₱675 semi
  const juanPhil = (Math.min(juanMonthly * 0.025, 2500)) / divisor; // Capped at ₱2,500 -> ₱1,250 semi
  const juanPagIbig = 200 / divisor;
  const juanTaxable = juanBase - (juanSss + juanPhil + juanPagIbig);
  const juanAnnualTax = 22500 + ((juanTaxable * (frequency === 'semi-monthly' ? 24 : 12)) - 400000) * 0.20;
  const juanTax = Math.max(0, juanAnnualTax / (frequency === 'semi-monthly' ? 24 : 12));
  const juanDeduct = juanSss + juanPhil + juanPagIbig + juanTax;
  const juanNet = juanGross - juanDeduct;

  // Employee 3: Elena Reyes (Shift Supervisor, ₱32k monthly + 110% night diff)
  const elenaMonthly = 32000;
  const elenaBase = elenaMonthly / divisor;
  const elenaNightDiff = (elenaMonthly / (26 * 8)) * 1.10 * 8; // 8 hrs night diff
  const elenaGross = elenaBase + elenaNightDiff;
  const elenaSss = (30000 * 0.045) / divisor; // Capped at ₱30k MSC
  const elenaPhil = (elenaMonthly * 0.025) / divisor;
  const elenaPagIbig = 200 / divisor;
  const elenaDeduct = elenaSss + elenaPhil + elenaPagIbig;
  const elenaNet = elenaGross - elenaDeduct;

  // Total Disbursal Pool
  const totalGross = mariaGross + juanGross + elenaGross;
  const totalNet = mariaNet + juanNet + elenaNet;

  const toggleDisbursal = () => {
    if (!isDisbursed) {
      const code = Math.floor(100000 + Math.random() * 900000);
      setStampHash(`BPI-PESONET-${code}-VERIFIED`);
      setIsDisbursed(true);
    } else {
      setIsDisbursed(false);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const config: PayrollDemoConfig = {
      employeeName: employeeName.trim() || 'Maria Santos',
      position: position.trim() || 'Operations Lead',
      monthlySalary,
      frequency,
      overtimeHours,
      allowances,
    };
    if (onCalculateDemo) {
      onCalculateDemo(config);
    }
    const el = document.getElementById('demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="overview" className="relative overflow-hidden min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-16 lg:pb-24">
        {/* Split Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Value Prop & Fast Sandbox Provisioning */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.12]">
              Payroll engineered with clarity, tactile care, and total compliance.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Eliminate error anxiety. Run multi-entity payroll, automatic statutory deductions (SSS, PhilHealth, Pag-IBIG), and biometric timesheets in an intuitive workspace built for people, not punch cards.
            </p>

            {/* Quick Payroll Estimator Card */}
            <div className="mt-8 rounded-3xl border border-sage-200/90 dark:border-sage-800/80 bg-white/90 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-lg shadow-sage-900/5 max-w-lg">
              <div className="flex items-center justify-between pb-3 border-b border-sage-100 dark:border-sage-900">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-sans">
                    Live Payroll Estimator
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  TRAIN 2024 Math
                </span>
              </div>

              <form onSubmit={handleCalculate} className="mt-4 space-y-3.5">
                {/* Employee Name & Position Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Employee Name
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/50 dark:bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Position / Role
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Operations Lead"
                      className="w-full rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/50 dark:bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Salary & Frequency Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="sm:col-span-7">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Monthly Base Salary
                      </label>
                      <span className="font-mono text-xs font-bold text-sage-800 dark:text-sage-200">
                        ₱{monthlySalary.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15000}
                      max={150000}
                      step={1000}
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(Number(e.target.value))}
                      className="w-full h-1.5 bg-sage-200 dark:bg-sage-800 rounded-lg appearance-none cursor-pointer accent-sage-600"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Cut-off Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-sage-100/70 dark:bg-slate-950/70 p-1 rounded-xl border border-sage-200 dark:border-sage-800">
                      <button
                        type="button"
                        onClick={() => setFrequency('semi-monthly')}
                        className={`px-1.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          frequency === 'semi-monthly'
                            ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        15th / 30th
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrequency('monthly')}
                        className={`px-1.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          frequency === 'monthly'
                            ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                </div>

                {/* Overtime & Allowance Stepper */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Overtime (DOLE 125%)
                    </label>
                    <div className="flex items-center rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/50 dark:bg-slate-950/50 px-2.5 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <span className="text-[11px] text-slate-400 font-medium">hrs</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      De Minimis / Allowance
                    </label>
                    <div className="flex items-center rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/50 dark:bg-slate-950/50 px-2.5 py-1.5">
                      <span className="text-[11px] text-slate-400 font-mono mr-1">₱</span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={allowances}
                        onChange={(e) => setAllowances(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white py-3 text-xs font-bold shadow-sm hover:shadow-md hover:shadow-sage-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Simulate Live Payroll Engine</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

              {/* Trust Tokens & Proof */}
              <div className="mt-6 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="HR User"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                    alt="Finance Officer"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80"
                    alt="Operations Manager"
                  />
                </div>
                <span>Trusted across 450+ Philippine & Southeast Asian teams</span>
              </div>
            </div>

          {/* Right Column: Live Payroll Command Console (Replaces static photo) */}
          <div
            className="lg:col-span-7 perspective-[1000px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative rounded-3xl border border-sage-200/90 dark:border-sage-800/80 bg-white/85 dark:bg-slate-900/80 p-4 sm:p-5 backdrop-blur-xl shadow-2xl shadow-sage-950/10"
            >
              {/* Specular Sheen Overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl z-30 opacity-20 dark:opacity-10 mix-blend-overlay"
                style={{
                  background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.7) 0%, transparent 60%)',
                }}
              />

              {/* Physical Recoil Disbursal Stamp */}
              <AnimatePresence>
                {isDisbursed && (
                  <motion.div
                    initial={{ scale: 2.8, rotate: -26, opacity: 0 }}
                    animate={{ scale: [2.8, 0.95, 1], rotate: [-26, -11, -12], opacity: 0.95 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.38, ease: [0.175, 0.885, 0.32, 1.275] }}
                    className="pointer-events-none absolute -top-3 -right-3 sm:top-2 sm:right-2 z-40 select-none"
                  >
                    <div className="border-3 border-dashed border-emerald-600 rounded-2xl px-4 py-2 bg-emerald-50/95 dark:bg-emerald-950/95 text-emerald-800 dark:text-emerald-200 font-mono font-black tracking-wider uppercase text-xs shadow-2xl ring-2 ring-emerald-500/40 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[11px] font-black">MAKER-CHECKER DISBURSED</div>
                        <div className="text-[9px] font-normal tracking-normal text-emerald-700 dark:text-emerald-400">
                          {stampHash}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Console Header & Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sage-100 dark:border-sage-900 pb-3 mb-3">
                <div className="flex items-center gap-1 rounded-xl bg-sage-100/70 dark:bg-sage-950/70 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setConsoleTab('live')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                      consoleTab === 'live'
                        ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    ⚡ Live Run (DOLE & OT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsoleTab('statutory')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                      consoleTab === 'statutory'
                        ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    🏛️ Statutory Triad
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsoleTab('bank')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                      consoleTab === 'bank'
                        ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    🏦 Bank Clearing
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isDisbursed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {isDisbursed ? '✓ Signed-Off & Disbursed' : 'Draft • Ready'}
                  </span>
                </div>
              </div>

              {/* TAB 1: LIVE RUN (DOLE & OVERTIME) */}
              {consoleTab === 'live' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Kroma Atelier Studio Inc. • {frequency === 'semi-monthly' ? 'Semi-Monthly' : 'Monthly'} Run
                    </span>
                    <span className="font-mono text-[10px]">DOLE 26-Day Standard</span>
                  </div>

                  {/* Row 1: Maria Santos (Live Linked to Estimator Inputs) */}
                  <div className="rounded-2xl border border-sage-300 dark:border-sage-700 bg-sage-50/60 dark:bg-slate-950/60 p-3 hover:border-sage-500 transition-all shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-sage-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {employeeName ? employeeName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {employeeName || 'Maria Santos'}
                            </span>
                            <span className="text-[10px] bg-sage-200/70 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 px-2 py-0.5 rounded-full font-medium">
                              {position || 'Operations Lead'}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                              Live Synced
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            Base: {formatCurrency(baseCutoff)} • DOLE OT ({overtimeHours}h):{' '}
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              +{formatCurrency(otPay)}
                            </span>{' '}
                            {allowanceCutoff > 0 && `• De Minimis: +${formatCurrency(allowanceCutoff)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Net Take-Home
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(mariaNet)}
                        </span>
                        <span className="text-[10px] text-rose-500 font-mono block">
                          -{formatCurrency(mariaTotalDeductions)} ded.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Juan Dela Cruz (₱30k MSC Cap Demonstration) */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-3 hover:border-sage-400 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          J
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100">Juan Dela Cruz</span>
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              ✓ SSS ₱30k MSC Cap
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            Base: {formatCurrency(juanBase)} • PhilHealth 2.5% auto-split • Form 2316 Tier 3
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Net Take-Home
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(juanNet)}
                        </span>
                        <span className="text-[10px] text-rose-500 font-mono block">
                          -{formatCurrency(juanDeduct)} ded.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Elena Reyes (DOLE Night Diff Demonstration) */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-3 hover:border-sage-400 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-sage-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          E
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100">Elena Reyes</span>
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-bold">
                              ✓ Night Diff (110%)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            Base: {formatCurrency(elenaBase)} • Night Shift OT: +{formatCurrency(elenaNightDiff)} • Pag-IBIG: -₱100
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Net Take-Home
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(elenaNet)}
                        </span>
                        <span className="text-[10px] text-rose-500 font-mono block">
                          -{formatCurrency(elenaDeduct)} ded.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STATUTORY TRIAD (2024 REGULATORY MATRICES) */}
              {consoleTab === 'statutory' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-1">
                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">SSS 2024 MSC Ceiling</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">₱30,000 MSC</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Mandatory 4.5% EE share capped at ₱1,350/mo. Automatic overflow into WISP Plus savings.
                    </p>
                  </div>

                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">PhilHealth 5% Pool</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">50/50 Split</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      2.5% employer & 2.5% employee contribution capped at ₱2,500 EE maximum. Direct EPRS export.
                    </p>
                  </div>

                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">BIR TRAIN Law (RA 10963)</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">0% Below ₱250k</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Graduated withholding brackets. De minimis rice subsidy and medical allowances automatically shielded.
                    </p>
                  </div>

                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Pag-IBIG / HDMF Fund</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">Circular 274</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Standard ₱100 semi-monthly (₱200/mo) employee deduction matching employer counterpart.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: BANK CLEARING (PESONet & InstaPay Formats) */}
              {consoleTab === 'bank' && (
                <div className="space-y-2 text-xs py-1">
                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        BPI BizLink Corporate Advice
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        16-Digit PESONet Direct Credit Batch (.csv)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      ✓ Batch Ready
                    </span>
                  </div>

                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        BDO PayLink / Host-to-Host
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Multi-Branch Corporate Disbursal Format (.dat)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-full border border-blue-300 dark:border-blue-800">
                      ✓ Batch Ready
                    </span>
                  </div>

                  <div className="p-3 bg-sage-50/70 dark:bg-slate-950/60 rounded-2xl border border-sage-200 dark:border-sage-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        UnionBank The Portal MSME
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Real-Time Disbursal Engine (.xlsx / Direct API)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                      ✓ Batch Ready
                    </span>
                  </div>
                </div>
              )}

              {/* Console Bottom Financial Summary Bar */}
              <div className="mt-4 pt-3 border-t border-sage-100 dark:border-sage-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Cut-Off Gross
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(totalGross)}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-sage-200 dark:bg-sage-800" />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
                      Net Take-Home Disbursal
                    </span>
                    <span className="text-sm sm:text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalNet)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleDisbursal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 px-3.5 py-2 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{isDisbursed ? 'Reset Sign-Off' : 'Simulate Disbursal Sign-Off'}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

