'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  Calculator,
  Printer,
  FileText,
  RotateCcw,
  MessageSquare,
  Sliders,
  CheckCircle2,
  Building2,
  Layers,
  Download,
  ShieldCheck,
  Award,
  Check,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { FAQS, type FAQItem, type PayrollDemoConfig, DEFAULT_DEMO_CONFIG } from './data';

function computePhilippinePayroll(
  monthlySalary: number,
  frequency: 'semi-monthly' | 'monthly',
  overtimeHours: number = 0,
  allowances: number = 0
) {
  const isSemi = frequency === 'semi-monthly';
  const baseSalaryCutoff = isSemi ? monthlySalary / 2 : monthlySalary;

  // DOLE standard: 26 working days/mo, 8 hours/day => standard hourly rate
  const hourlyRate = monthlySalary / (26 * 8);
  // DOLE regular overtime multiplier: 125%
  const overtimePay = Math.round(hourlyRate * 1.25 * overtimeHours);

  // Gross Earnings for this pay cycle
  const grossPay = baseSalaryCutoff + overtimePay + allowances;

  // SSS EE Share (2024 table: 4.5%, MSC ceiling ₱30,000 => ₱1,350/mo max, ₱675 semi)
  const sssMonthly = Math.min(1350, Math.max(180, monthlySalary * 0.045));
  const sss = isSemi ? sssMonthly / 2 : sssMonthly;

  // PhilHealth EE Share (5% split 50/50 => 2.5% EE share, min ₱250, max ₱2,500/mo)
  const phMonthly = Math.min(2500, Math.max(250, monthlySalary * 0.025));
  const philhealth = isSemi ? phMonthly / 2 : phMonthly;

  // Pag-IBIG / HDMF EE Share (₱200 monthly / ₱100 semi-monthly)
  const pagibig = isSemi ? 100 : 200;

  const totalMandatory = sss + philhealth + pagibig;

  // Taxable Income (Gross minus non-taxable mandatory deductions & tax-shielded de minimis)
  const taxableIncome = Math.max(0, (baseSalaryCutoff + overtimePay) - totalMandatory);

  // BIR TRAIN Withholding Tax Table (Graduated brackets for semi-monthly and monthly)
  let tax = 0;
  let taxBracketLabel = 'Tax Exempt (Below ₱250k/yr)';
  if (isSemi) {
    if (taxableIncome <= 10417) {
      tax = 0;
      taxBracketLabel = 'Tier 1: 0% (Tax Exempt)';
    } else if (taxableIncome <= 16667) {
      tax = (taxableIncome - 10417) * 0.15;
      taxBracketLabel = 'Tier 2: 15% over ₱10,417';
    } else if (taxableIncome <= 33333) {
      tax = 937.5 + (taxableIncome - 16667) * 0.20;
      taxBracketLabel = 'Tier 3: ₱937.50 + 20% over ₱16,667';
    } else if (taxableIncome <= 83333) {
      tax = 4270.83 + (taxableIncome - 33333) * 0.25;
      taxBracketLabel = 'Tier 4: ₱4,270.83 + 25% over ₱33,333';
    } else {
      tax = 16770.83 + (taxableIncome - 83333) * 0.30;
      taxBracketLabel = 'Tier 5: ₱16,770.83 + 30% over ₱83,333';
    }
  } else {
    if (taxableIncome <= 20833) {
      tax = 0;
      taxBracketLabel = 'Tier 1: 0% (Tax Exempt)';
    } else if (taxableIncome <= 33333) {
      tax = (taxableIncome - 20833) * 0.15;
      taxBracketLabel = 'Tier 2: 15% over ₱20,833';
    } else if (taxableIncome <= 66667) {
      tax = 1875 + (taxableIncome - 33333) * 0.20;
      taxBracketLabel = 'Tier 3: ₱1,875 + 20% over ₱33,333';
    } else if (taxableIncome <= 166667) {
      tax = 8541.67 + (taxableIncome - 66667) * 0.25;
      taxBracketLabel = 'Tier 4: ₱8,541.67 + 25% over ₱66,667';
    } else {
      tax = 33541.67 + (taxableIncome - 166667) * 0.30;
      taxBracketLabel = 'Tier 5: ₱33,541.67 + 30% over ₱166,667';
    }
  }

  const totalDeductions = totalMandatory + tax;
  const netPay = Math.max(0, grossPay - totalDeductions);

  return {
    baseSalaryCutoff: Math.round(baseSalaryCutoff),
    hourlyRate: Number(hourlyRate.toFixed(2)),
    overtimePay: Math.round(overtimePay),
    allowances: Math.round(allowances),
    grossPay: Math.round(grossPay),
    sss: Math.round(sss),
    philhealth: Math.round(philhealth),
    pagibig: Math.round(pagibig),
    totalMandatory: Math.round(totalMandatory),
    taxableIncome: Math.round(taxableIncome),
    tax: Math.round(tax),
    taxBracketLabel,
    totalDeductions: Math.round(totalDeductions),
    netPay: Math.round(netPay),
  };
}

interface AuditPin {
  id: number;
  x: number;
  y: number;
  text: string;
  author: string;
  timeAgo: string;
  category: string;
}

export function WorkspaceDemo({
  demoConfig,
  highlightNonce,
}: {
  demoConfig?: PayrollDemoConfig;
  highlightNonce?: number;
}) {
  const [employeeName, setEmployeeName] = useState(demoConfig?.employeeName ?? DEFAULT_DEMO_CONFIG.employeeName);
  const [position, setPosition] = useState(demoConfig?.position ?? DEFAULT_DEMO_CONFIG.position);
  const [monthlySalary, setMonthlySalary] = useState<number>(demoConfig?.monthlySalary ?? DEFAULT_DEMO_CONFIG.monthlySalary);
  const [frequency, setFrequency] = useState<'semi-monthly' | 'monthly'>(demoConfig?.frequency ?? DEFAULT_DEMO_CONFIG.frequency);
  const [overtimeHours, setOvertimeHours] = useState<number>(demoConfig?.overtimeHours ?? DEFAULT_DEMO_CONFIG.overtimeHours);
  const [allowances, setAllowances] = useState<number>(demoConfig?.allowances ?? DEFAULT_DEMO_CONFIG.allowances);

  const [viewMode, setViewMode] = useState<'ledger' | 'breakdown' | 'payslip'>('ledger');
  const [makerCheckerStatus, setMakerCheckerStatus] = useState<'draft' | 'approved'>('draft');
  const [bankBatchHash, setBankBatchHash] = useState<string | null>(null);

  const [pins, setPins] = useState<AuditPin[]>([
    {
      id: 1,
      x: 18,
      y: 32,
      text: 'TRAIN Law graduated tax verified against BIR 2024 table',
      author: 'Elena R. (Audit)',
      timeAgo: 'Just now',
      category: 'BIR Tax',
    },
    {
      id: 2,
      x: 82,
      y: 45,
      text: 'DOLE 125% regular overtime rate confirmed with biometrics',
      author: 'Marcus V. (HR)',
      timeAgo: '5m ago',
      category: 'DOLE OT',
    },
  ]);
  const [activePinId, setActivePinId] = useState<number | null>(null);
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [newPinText, setNewPinText] = useState('');
  const [newPinCategory, setNewPinCategory] = useState('Compliance');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [downloading, setDownloading] = useState(false);
  const [hasReceivedHeroUpdate, setHasReceivedHeroUpdate] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Sync state when hero submits
  useEffect(() => {
    if (demoConfig) {
      setEmployeeName(demoConfig.employeeName);
      setPosition(demoConfig.position);
      setMonthlySalary(demoConfig.monthlySalary);
      setFrequency(demoConfig.frequency);
      setOvertimeHours(demoConfig.overtimeHours);
      setAllowances(demoConfig.allowances);
      setMakerCheckerStatus('draft');
      setBankBatchHash(null);
      setHasReceivedHeroUpdate(true);
      const timer = setTimeout(() => setHasReceivedHeroUpdate(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [demoConfig, highlightNonce]);

  const calc = useMemo(
    () => computePhilippinePayroll(monthlySalary, frequency, overtimeHours, allowances),
    [monthlySalary, frequency, overtimeHours, allowances]
  );

  const handleApproveDisbursal = () => {
    if (makerCheckerStatus === 'draft') {
      const randomHash = `BPI-PESONET-${Math.floor(100000 + Math.random() * 900000)}-VERIFIED`;
      setBankBatchHash(randomHash);
      setMakerCheckerStatus('approved');
    } else {
      setMakerCheckerStatus('draft');
      setBankBatchHash(null);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Background
      doc.setFillColor(248, 250, 248);
      doc.rect(0, 0, 210, 297, 'F');

      // Main Container Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, 15, 180, 267, 4, 4, 'F');
      doc.setDrawColor(208, 219, 207);
      doc.setLineWidth(0.4);
      doc.roundedRect(15, 15, 180, 267, 4, 4, 'D');

      // Top Header Bar (Tactile Sage)
      doc.setFillColor(83, 108, 81);
      doc.roundedRect(15, 15, 180, 24, 4, 4, 'F');
      doc.rect(15, 30, 180, 9, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text('SHINPAY+ WORKSPACE', 25, 26);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL PHILIPPINE STATUTORY COMPENSATION SLIP • BIR FORM 2316 COMPLIANT', 25, 33);

      // Company & Employee Info Block
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Kroma Atelier Studio Inc.', 25, 48);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Pay Cycle: ${frequency === 'semi-monthly' ? 'Semi-Monthly (1st — 15th)' : 'Monthly Standard'}`, 25, 54);
      doc.text('Disbursement Date: September 15, 2026', 25, 60);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Employee: ${employeeName}`, 115, 48);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Position: ${position}`, 115, 54);
      doc.text(`Tax Tier: ${calc.taxBracketLabel}`, 115, 60);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(25, 66, 185, 66);

      // Two Column Table Headers
      doc.setFillColor(241, 245, 249);
      doc.rect(25, 72, 75, 7, 'F');
      doc.rect(110, 72, 75, 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text('GROSS EARNINGS', 28, 77);
      doc.text('STATUTORY DEDUCTIONS', 113, 77);

      // Earnings Line Items
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      doc.text('Basic Pay Rate', 28, 87);
      doc.text(`PHP ${calc.baseSalaryCutoff.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 98, 87, { align: 'right' });

      doc.text(`Overtime Pay (${overtimeHours} hrs @ 125%)`, 28, 95);
      doc.text(`PHP ${calc.overtimePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 98, 95, { align: 'right' });

      doc.text('De Minimis / Allowances', 28, 103);
      doc.text(`PHP ${calc.allowances.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 98, 103, { align: 'right' });

      // Deductions Line Items
      doc.text('SSS Contribution (EE Share)', 113, 87);
      doc.text(`-PHP ${calc.sss.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 183, 87, { align: 'right' });

      doc.text('PhilHealth (2.5% EE Share)', 113, 95);
      doc.text(`-PHP ${calc.philhealth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 183, 95, { align: 'right' });

      doc.text('Pag-IBIG / HDMF Fund', 113, 103);
      doc.text(`-PHP ${calc.pagibig.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 183, 103, { align: 'right' });

      doc.text('BIR Withholding Tax (TRAIN)', 113, 111);
      doc.text(`-PHP ${calc.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 183, 111, { align: 'right' });

      // Totals Divider
      doc.line(25, 120, 185, 120);

      doc.setFont('helvetica', 'bold');
      doc.text('Total Gross Earnings', 28, 128);
      doc.text(`PHP ${calc.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 98, 128, { align: 'right' });

      doc.text('Total Deductions', 113, 128);
      doc.setTextColor(220, 38, 38);
      doc.text(`-PHP ${calc.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 183, 128, { align: 'right' });

      // Take Home Net Pay Box
      doc.setFillColor(230, 235, 229);
      doc.roundedRect(25, 137, 160, 22, 3, 3, 'F');
      doc.setDrawColor(83, 108, 81);
      doc.roundedRect(25, 137, 160, 22, 3, 3, 'D');

      doc.setTextColor(67, 86, 65);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('NET TAKE HOME PAY (DISBURSED)', 32, 146);

      doc.setFontSize(15);
      doc.setTextColor(22, 101, 52);
      doc.text(`PHP ${calc.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 180, 152, { align: 'right' });

      // Regulatory Compliance Box
      doc.setFillColor(248, 250, 252);
      doc.rect(25, 168, 160, 44, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(25, 168, 160, 44, 'D');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('PHILIPPINE REGULATORY COMPLIANCE ATTESTATION:', 30, 175);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('• Republic Act 10963 (TRAIN Law) compliant graduated withholding tax algorithm.', 30, 182);
      doc.text('• Social Security System (SSS) 2024 MSC ceiling capped at PHP 30,000.', 30, 188);
      doc.text('• Philippine Health Insurance Corp. (PhilHealth) 5% premium split 50/50 employer/employee.', 30, 194);
      doc.text('• Home Development Mutual Fund (HDMF / Pag-IBIG) mandatory standard remittance.', 30, 200);
      doc.text(`• Electronic record snapshotted in ShinPay+ permanent ledger (Hash: ${bankBatchHash || 'SHIN-PH-2026-09A'}).`, 30, 206);

      // Signatures
      doc.setDrawColor(203, 213, 225);
      doc.line(35, 238, 85, 238);
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Prepared By: Payroll Officer', 38, 243);

      doc.line(125, 238, 175, 238);
      doc.text('Employee Signature / Acknowledgement', 126, 243);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Computer-generated payslip for ${employeeName} via ShinPay+ Workspace. BIR Form 2316 official draft.`, 105, 270, { align: 'center' });

      doc.save(`ShinPay+_${employeeName.replace(/\s+/g, '_')}_Payslip.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleRemovePin = (pinId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPins((prev) => prev.filter((p) => p.id !== pinId));
    if (activePinId === pinId) setActivePinId(null);
  };

  const handleClearAllPins = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPins([]);
    setActivePinId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If click was on a button, input, textarea, or an existing pin, don't drop a new pin
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('textarea') ||
      (e.target as HTMLElement).closest('.pin-element')
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Trigger visual sonar ripple
    const rippleId = Date.now();
    setRipples((prev) => [...prev, { id: rippleId, x: clickX, y: clickY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 1200);

    const x = Math.max(10, Math.min(90, Math.round((clickX / rect.width) * 100)));
    const y = Math.max(12, Math.min(88, Math.round((clickY / rect.height) * 100)));

    const sampleNotes = [
      { text: 'Audited statutory deduction split (SSS/PhilHealth/Pag-IBIG)', cat: 'Statutory' },
      { text: 'TRAIN Law withholding tax bracket double-checked', cat: 'BIR Tax' },
      { text: 'Biometric time log verified against DOLE overtime calculation', cat: 'DOLE OT' },
      { text: 'Tax-exempt de minimis allowance validated', cat: 'Benefits' },
      { text: 'Maker-Checker approval pre-check cleared for bank clearing', cat: 'Disbursal' },
    ];
    const picked = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];

    const newPin: AuditPin = {
      id: rippleId,
      x,
      y,
      text: picked.text,
      author: 'You (Auditor)',
      timeAgo: 'Just now',
      category: picked.cat,
    };
    setPins((prev) => [...prev, newPin]);
    setActivePinId(newPin.id);
  };

  const handleAddCustomPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinText.trim()) return;

    const predefinedPositions = [
      { x: 16, y: 38 },
      { x: 84, y: 36 },
      { x: 18, y: 68 },
      { x: 82, y: 66 },
      { x: 50, y: 18 },
    ];
    const pos = predefinedPositions[pins.length % predefinedPositions.length];

    const newPin: AuditPin = {
      id: Date.now(),
      x: pos.x,
      y: pos.y,
      text: newPinText.trim(),
      author: 'You (Auditor)',
      timeAgo: 'Just now',
      category: newPinCategory,
    };

    setPins((prev) => [...prev, newPin]);
    setActivePinId(newPin.id);
    setNewPinText('');
    setShowAddPinModal(false);
  };

  return (
    <section id="demo" className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            In-Browser Payroll Sandbox
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Real Philippine statutory calculation engine with DOLE overtime rules, graduated BIR TRAIN brackets, and Maker-Checker disbursal sign-off.
          </p>

          {hasReceivedHeroUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 shadow-sm"
            >
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Loaded custom employee: <strong>{employeeName}</strong> (₱{monthlySalary.toLocaleString()} • {frequency})</span>
            </motion.div>
          )}
        </div>

        {/* The Sandbox Simulator Container */}
        <div className={`mt-12 rounded-3xl border transition-all duration-500 ${hasReceivedHeroUpdate ? 'border-emerald-400 ring-4 ring-emerald-400/20' : 'border-sage-200/90 dark:border-sage-800'} bg-white dark:bg-slate-900 shadow-xl shadow-sage-900/5 overflow-hidden`}>
          
          {/* Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sage-200 dark:border-sage-800/80 bg-sage-50/60 dark:bg-slate-950/60 px-6 py-4 text-xs">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-xl p-1 border border-sage-200 dark:border-sage-800">
              <button
                type="button"
                onClick={() => setViewMode('ledger')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'ledger'
                    ? 'bg-sage-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Calculator className="h-3.5 w-3.5" />
                Summary Ledger
              </button>

              <button
                type="button"
                onClick={() => setViewMode('breakdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'breakdown'
                    ? 'bg-sage-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                DOLE & Tax Breakdown
              </button>

              <button
                type="button"
                onClick={() => setViewMode('payslip')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'payslip'
                    ? 'bg-sage-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Printer className="h-3.5 w-3.5" />
                Printable Payslip
              </button>
            </div>

            {/* Maker-Checker Workflow Simulator */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApproveDisbursal}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                  makerCheckerStatus === 'approved'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-sage-300 dark:border-sage-700 bg-white dark:bg-slate-800 text-sage-800 dark:text-sage-200 hover:bg-sage-50'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{makerCheckerStatus === 'approved' ? '✓ Disbursed & Signed-Off' : 'Simulate Disbursal Sign-Off'}</span>
              </button>

              {pins.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllPins}
                  className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2 py-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Pins ({pins.length})
                </button>
              )}
            </div>
          </div>

          {/* Interactive Parameters Bar */}
          <div className="px-6 py-4 bg-white dark:bg-slate-900/50 border-b border-sage-100 dark:border-sage-900 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Employee & Position:</span>
              <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                {employeeName} • <span className="text-sage-600 dark:text-sage-400">{position}</span>
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Base Salary:</span>
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Overtime Hours:</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {overtimeHours} hrs (₱{calc.overtimePay.toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full h-1.5 bg-sage-200 dark:bg-sage-800 rounded-lg appearance-none cursor-pointer accent-sage-600"
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <span className="text-[11px] font-medium text-slate-500">Frequency:</span>
              <div className="flex bg-sage-100/70 dark:bg-slate-950/70 p-0.5 rounded-lg border border-sage-200 dark:border-sage-800">
                <button
                  type="button"
                  onClick={() => setFrequency('semi-monthly')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    frequency === 'semi-monthly'
                      ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  15th/30th
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    frequency === 'monthly'
                      ? 'bg-white dark:bg-sage-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          {/* Live Canvas Area */}
          <div
            onClick={handleCanvasClick}
            className="relative min-h-[560px] p-6 sm:p-12 bg-slate-50 dark:bg-slate-950/70 cursor-crosshair select-none flex items-center justify-center overflow-hidden"
          >
            {/* Architectural Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(135,162,133,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(135,162,133,0.06)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

            {/* Sonar Ripple Waves upon Click */}
            {ripples.map((rip) => (
              <motion.div
                key={rip.id}
                initial={{ scale: 0.15, opacity: 0.9 }}
                animate={{ scale: 3.8, opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                style={{ left: rip.x, top: rip.y }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sage-500/70 w-16 h-16 z-20"
              />
            ))}

            {/* Audit Review Pin Control Toolbar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/95 dark:bg-slate-900/95 border border-sage-200 dark:border-sage-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {pins.length} Review {pins.length === 1 ? 'Pin' : 'Pins'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    Click anywhere to drop a pin
                  </span>
                  {bankBatchHash && (
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                      • Hash: {bankBatchHash}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddPinModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Review Pin</span>
                </button>

                {pins.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllPins}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* View Mode 1: Summary Ledger */}
            {viewMode === 'ledger' && (
              <motion.div
                layout
                className="relative z-10 w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border-2 border-sage-300 dark:border-sage-700 p-6 shadow-2xl"
              >
                {/* Physical Recoil Approved Stamp */}
                <AnimatePresence>
                  {makerCheckerStatus === 'approved' && (
                    <motion.div
                      key="recoil-stamp-ledger"
                      initial={{ scale: 2.8, opacity: 0, rotate: -26 }}
                      animate={{ scale: 1, opacity: 0.95, rotate: -12 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18, mass: 0.8 }}
                      className="pointer-events-none absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-40 select-none"
                    >
                      <div className="border-3 border-emerald-600 dark:border-emerald-400 rounded-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/15 backdrop-blur-xs text-emerald-700 dark:text-emerald-300 font-mono font-black tracking-wider uppercase text-[11px] sm:text-xs shadow-xl flex items-center gap-2 ring-2 ring-emerald-500/25">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div>MAKER-CHECKER VERIFIED</div>
                          {bankBatchHash && (
                            <div className="text-[9px] font-normal tracking-normal text-emerald-600 dark:text-emerald-400 opacity-90">
                              {bankBatchHash}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-sage-900">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-sage-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {employeeName} — {position}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {frequency === 'semi-monthly' ? 'Semi-Monthly Cut-off (1st — 15th)' : 'Monthly Standard Run'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    makerCheckerStatus === 'approved'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                  }`}>
                    {makerCheckerStatus === 'approved' ? '✓ Disbursed & Signed' : 'Draft • Ready for Review'}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Cut-off Base Salary</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      ₱{calc.baseSalaryCutoff.toLocaleString()}
                    </span>
                  </div>

                  {calc.overtimePay > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                      <span>DOLE Overtime Pay ({overtimeHours}h @ 125%)</span>
                      <span className="font-mono font-semibold">+₱{calc.overtimePay.toLocaleString()}</span>
                    </div>
                  )}

                  {calc.allowances > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                      <span>De Minimis & Allowances</span>
                      <span className="font-mono font-semibold">+₱{calc.allowances.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-1.5 pb-1 border-y border-sage-100 dark:border-sage-800 flex justify-between font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">Total Period Gross</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">₱{calc.grossPay.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>SSS Contribution (EE Share)</span>
                    <span className="font-mono font-semibold">-₱{calc.sss.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>PhilHealth (2.5% EE Share)</span>
                    <span className="font-mono font-semibold">-₱{calc.philhealth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Pag-IBIG / HDMF Fund</span>
                    <span className="font-mono font-semibold">-₱{calc.pagibig.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>BIR Withholding Tax ({calc.taxBracketLabel.split(':')[0]})</span>
                    <span className="font-mono font-semibold">-₱{calc.tax.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t-2 border-sage-200 dark:border-sage-700 flex justify-between items-center font-bold">
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 text-sm">Take Home Net Pay</p>
                      <p className="text-[10px] text-slate-400 font-normal font-mono">100% Tax Compliant</p>
                    </div>
                    <span className="text-xl font-mono text-emerald-600 dark:text-emerald-400">
                      ₱{calc.netPay.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* View Mode 2: DOLE & Tax Audit Worksheet */}
            {viewMode === 'breakdown' && (
              <motion.div
                layout
                className="relative z-10 w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border-2 border-sage-300 dark:border-sage-700 p-6 shadow-2xl text-xs"
              >
                {/* Physical Recoil Approved Stamp */}
                <AnimatePresence>
                  {makerCheckerStatus === 'approved' && (
                    <motion.div
                      key="recoil-stamp-breakdown"
                      initial={{ scale: 2.8, opacity: 0, rotate: -26 }}
                      animate={{ scale: 1, opacity: 0.95, rotate: -12 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18, mass: 0.8 }}
                      className="pointer-events-none absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-40 select-none"
                    >
                      <div className="border-3 border-emerald-600 dark:border-emerald-400 rounded-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/15 backdrop-blur-xs text-emerald-700 dark:text-emerald-300 font-mono font-black tracking-wider uppercase text-[11px] sm:text-xs shadow-xl flex items-center gap-2 ring-2 ring-emerald-500/25">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div>MAKER-CHECKER VERIFIED</div>
                          {bankBatchHash && (
                            <div className="text-[9px] font-normal tracking-normal text-emerald-600 dark:text-emerald-400 opacity-90">
                              {bankBatchHash}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between pb-3 border-b border-sage-100 dark:border-sage-900">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sage-600" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Philippine Statutory & DOLE Math Audit
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-950 px-2 py-0.5 rounded border border-sage-200">
                    DOLE RA 10963 Rules
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {/* DOLE Overtime Math Card */}
                  <div className="rounded-xl bg-sage-50/70 dark:bg-sage-950/60 p-3 border border-sage-200/80 dark:border-sage-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">DOLE Overtime Calculation</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        ₱{calc.overtimePay.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                      Hourly Rate: ₱{monthlySalary.toLocaleString()} ÷ 26 days ÷ 8h = <strong>₱{calc.hourlyRate}/hr</strong>.
                      <br />
                      Overtime Rate: ₱{calc.hourlyRate} × 1.25 (125%) × {overtimeHours}h = <strong>₱{calc.overtimePay.toLocaleString()}</strong>.
                    </p>
                  </div>

                  {/* Statutory Split Card */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-sage-200/80 dark:border-sage-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Mandatory Statutory Caps:</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block">SSS Cap</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200 text-xs">₱{calc.sss}</strong>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block">PhilHealth 2.5%</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200 text-xs">₱{calc.philhealth}</strong>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block">Pag-IBIG</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200 text-xs">₱{calc.pagibig}</strong>
                      </div>
                    </div>
                  </div>

                  {/* BIR TRAIN Tier Card */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-sage-200/80 dark:border-sage-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">BIR Withholding Bracket</span>
                      <span className="font-mono font-bold text-rose-600">
                        ₱{calc.tax.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Taxable Income: ₱{calc.taxableIncome.toLocaleString()} ({calc.taxBracketLabel})
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* View Mode 3: Printable Payslip Preview */}
            {viewMode === 'payslip' && (
              <motion.div
                layout
                className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border-2 border-sage-300 dark:border-sage-700 p-6 shadow-2xl text-xs"
              >
                {/* Physical Recoil Approved Stamp */}
                <AnimatePresence>
                  {makerCheckerStatus === 'approved' && (
                    <motion.div
                      key="recoil-stamp-payslip"
                      initial={{ scale: 2.8, opacity: 0, rotate: -26 }}
                      animate={{ scale: 1, opacity: 0.95, rotate: -12 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18, mass: 0.8 }}
                      className="pointer-events-none absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-40 select-none"
                    >
                      <div className="border-3 border-emerald-600 dark:border-emerald-400 rounded-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/15 backdrop-blur-xs text-emerald-700 dark:text-emerald-300 font-mono font-black tracking-wider uppercase text-[11px] sm:text-xs shadow-xl flex items-center gap-2 ring-2 ring-emerald-500/25">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div>MAKER-CHECKER VERIFIED</div>
                          {bankBatchHash && (
                            <div className="text-[9px] font-normal tracking-normal text-emerald-600 dark:text-emerald-400 opacity-90">
                              {bankBatchHash}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="text-center pb-3 border-b-2 border-slate-900 dark:border-slate-100">
                  <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                    SHINPAY+ WORKSPACE
                  </h4>
                  <p className="text-[11px] text-slate-500">Official Compensation Payslip • BIR Form 2316 Compliant</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-sage-200 dark:border-sage-800">
                  <div><span className="text-slate-400">Employee:</span> {employeeName}</div>
                  <div><span className="text-slate-400">Position:</span> {position}</div>
                  <div><span className="text-slate-400">Schedule:</span> {frequency}</div>
                  <div><span className="text-slate-400">Pay Date:</span> Sep 15, 2026</div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold uppercase text-[10px] text-slate-400 mb-1">Earnings</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Basic Pay:</span>
                        <span className="font-mono font-semibold">₱{calc.baseSalaryCutoff.toLocaleString()}</span>
                      </div>
                      {calc.overtimePay > 0 && (
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                          <span>Overtime ({overtimeHours}h):</span>
                          <span className="font-mono font-semibold">₱{calc.overtimePay.toLocaleString()}</span>
                        </div>
                      )}
                      {calc.allowances > 0 && (
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                          <span>Allowances:</span>
                          <span className="font-mono font-semibold">₱{calc.allowances.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Total Gross:</span>
                        <span className="font-mono">₱{calc.grossPay.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold uppercase text-[10px] text-slate-400 mb-1">Deductions</p>
                    <div className="space-y-1 text-rose-600">
                      <div className="flex justify-between">
                        <span>SSS:</span>
                        <span className="font-mono font-semibold">-₱{calc.sss.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PhilHealth:</span>
                        <span className="font-mono font-semibold">-₱{calc.philhealth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pag-IBIG:</span>
                        <span className="font-mono font-semibold">-₱{calc.pagibig.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BIR Tax:</span>
                        <span className="font-mono font-semibold">-₱{calc.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-slate-100 dark:border-slate-800 text-rose-700">
                        <span>Total Ded:</span>
                        <span className="font-mono">-₱{calc.totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-sage-50 dark:bg-sage-950 p-3 text-center border border-sage-200 dark:border-sage-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Take Home Net Pay</span>
                  <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₱{calc.netPay.toLocaleString()}
                  </p>
                </div>

                {/* Download Sample Payslip Actions */}
                <div className="mt-4 pt-3 border-t border-sage-200 dark:border-sage-800 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPdf();
                    }}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{downloading ? 'Generating PDF...' : `Download ${employeeName.split(' ')[0]}'s Payslip (PDF)`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sage-200 dark:border-sage-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Render Dropped Review Audit Pins */}
            <AnimatePresence>
              {pins.map((pin) => {
                const isExpanded = activePinId === pin.id;
                return (
                  <motion.div
                    key={pin.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className="absolute z-30 pin-element group pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePinId(isExpanded ? null : pin.id);
                    }}
                  >
                    <div className="relative -translate-x-1/2 -translate-y-1/2">
                      {/* Pulsing Pin Head */}
                      <button
                        type="button"
                        className="relative flex h-7 w-7 items-center justify-center rounded-full bg-sage-600 hover:bg-sage-700 text-white shadow-lg ring-2 ring-white dark:ring-slate-900 cursor-pointer transition-transform group-hover:scale-110 active:scale-95"
                        title="Click to view details or remove pin"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                      </button>

                      {/* Popover Card */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute left-9 top-1/2 -translate-y-1/2 w-64 rounded-2xl border border-sage-200 dark:border-sage-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 shadow-xl z-40 transition-all ${
                          isExpanded
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                              {pin.author}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">• {pin.timeAgo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleRemovePin(pin.id, e)}
                            className="h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors shrink-0"
                            title="Remove pin"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-snug">
                          {pin.text}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-sage-100 dark:border-sage-800/80 flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950 text-sage-700 dark:text-sage-300">
                            {pin.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleRemovePin(pin.id, e)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove Pin</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        {/* Add Review Pin Modal */}
        <AnimatePresence>
          {showAddPinModal && (
            <div
              onClick={() => setShowAddPinModal(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-sage-200 dark:border-sage-800 bg-white dark:bg-slate-900 p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-sage-100 dark:border-sage-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-sage-700 dark:text-sage-300">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Audit Review Pin</h3>
                      <p className="text-[11px] text-slate-500">Leave an audit verification note on this run</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPinModal(false)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="mt-4">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Quick Audit Presets (Click to use)
                  </label>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {[
                      { note: '✓ TRAIN Law graduated tax verified against BIR 2024 table', cat: 'BIR Tax' },
                      { note: '✓ SSS 2024 MSC ceiling capped at ₱30,000 threshold', cat: 'SSS' },
                      { note: '✓ PhilHealth 5% equal 50/50 employer/employee split checked', cat: 'PhilHealth' },
                      { note: '✓ DOLE regular overtime 125% rate confirmed with timesheet', cat: 'DOLE OT' },
                      { note: '✓ Tax-exempt de minimis allowances validated', cat: 'De Minimis' },
                      { note: '✓ Pag-IBIG ₱200 mandatory employee contribution confirmed', cat: 'Pag-IBIG' },
                    ].map((preset) => (
                      <button
                        key={preset.note}
                        type="button"
                        onClick={() => {
                          setNewPinText(preset.note);
                          setNewPinCategory(preset.cat);
                        }}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl bg-sage-50/80 hover:bg-sage-100 dark:bg-slate-950/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-sage-200/60 dark:border-sage-800/60 transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{preset.note}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sage-200/60 dark:bg-sage-900 text-sage-800 dark:text-sage-200 shrink-0">
                          {preset.cat}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddCustomPin} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Audit Note / Memo
                    </label>
                    <textarea
                      rows={2}
                      value={newPinText}
                      onChange={(e) => setNewPinText(e.target.value)}
                      placeholder="Type or select a note..."
                      className="w-full rounded-xl border border-sage-200 dark:border-sage-800 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPinModal(false)}
                      className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPinText.trim()}
                      className="rounded-xl bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Add Pin
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        </div>

        {/* FAQ Accordion Section */}
        <div id="faq" className="mt-28 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Clear answers on statutory updates, corporate bank advice formats, and data security.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-sage-200/90 dark:border-sage-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 transition-colors hover:text-sage-700 dark:hover:text-sage-300"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sage-600' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-sage-100 dark:border-sage-900">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
