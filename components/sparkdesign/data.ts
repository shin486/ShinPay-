export interface HeroPayrollRun {
  id: string;
  name: string;
  period: string;
  businessName: string;
  tag: string;
  image: string;
  accentColor: string;
  badgeText: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  currencySymbol: string;
  exceptions: {
    author: string;
    avatar: string;
    text: string;
    category: 'overtime' | 'statutory' | 'approval' | 'allowance';
    timeAgo: string;
    position: { x: number; y: number }; // percentage coordinates
  }[];
}

export interface PayrollDemoConfig {
  employeeName: string;
  position: string;
  monthlySalary: number;
  frequency: 'semi-monthly' | 'monthly';
  overtimeHours: number;
  allowances: number;
}

export const DEFAULT_DEMO_CONFIG: PayrollDemoConfig = {
  employeeName: 'Maria Santos',
  position: 'Operations & Shift Lead',
  monthlySalary: 38000,
  frequency: 'semi-monthly',
  overtimeHours: 6,
  allowances: 2000,
};

export const HERO_PAYROLL_RUNS: HeroPayrollRun[] = [
  {
    id: 'creative-studio',
    name: 'Creative Studio & Agency',
    period: 'Sep 01 — Sep 15, 2026',
    businessName: 'Kroma Atelier Studio Inc.',
    tag: 'Salaried + Project Bonus',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#87a285',
    badgeText: 'Audit Verified • Ready to Disburse',
    employeeCount: 28,
    totalGross: 945000,
    totalDeductions: 132450,
    totalNet: 812550,
    currencySymbol: '₱',
    exceptions: [
      {
        author: 'Elena R. (HR Lead)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        text: 'Approved 6.5h weekend overtime for branding pitch team.',
        category: 'overtime',
        timeAgo: '12m ago',
        position: { x: 58, y: 26 },
      },
      {
        author: 'Finance Audit',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        text: 'SSS & PhilHealth statutory contribution ceilings auto-capped.',
        category: 'statutory',
        timeAgo: '45m ago',
        position: { x: 22, y: 64 },
      },
    ],
  },
  {
    id: 'retail-shift',
    name: 'Retail & Convenience Shift',
    period: 'Sep 01 — Sep 15, 2026',
    businessName: 'Forma Objects Retail Group',
    tag: 'Hourly DTR + Night Diff + Holiday Rate',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#6a8668',
    badgeText: 'Biometrics Reconciled',
    employeeCount: 64,
    totalGross: 1280400,
    totalDeductions: 198200,
    totalNet: 1082200,
    currencySymbol: '₱',
    exceptions: [
      {
        author: 'Store Operations',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        text: 'Special Non-Working Holiday rate (130%) computed for 18 branch staff.',
        category: 'allowance',
        timeAgo: 'Just now',
        position: { x: 48, y: 32 },
      },
    ],
  },
  {
    id: 'healthcare-clinical',
    name: 'Healthcare & Clinical Center',
    period: 'Bi-Monthly • Cycle 1',
    businessName: 'St. Claire Diagnostic & Dialysis Clinic',
    tag: 'Hazard Pay + SSS MSC Cap + Rotating Night Shifts',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#536c51',
    badgeText: 'DOH / PhilHealth EPRS Ready',
    employeeCount: 42,
    totalGross: 1420000,
    totalDeductions: 215400,
    totalNet: 1204600,
    currencySymbol: '₱',
    exceptions: [
      {
        author: 'Head Nurse Joy',
        avatar: 'https://images.unsplash.com/photo-1594824813590-349f7b4ec8b6?auto=format&fit=crop&w=120&q=80',
        text: '10% Night differential automatically appended to ICU shift rotations.',
        category: 'allowance',
        timeAgo: '5m ago',
        position: { x: 62, y: 30 },
      },
      {
        author: 'Compliance Officer',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=120&q=80',
        text: 'PhilHealth 5% employee-employer 50/50 split verified for EPRS file.',
        category: 'statutory',
        timeAgo: '20m ago',
        position: { x: 26, y: 68 },
      },
    ],
  },
  {
    id: 'bpo-tech',
    name: '24/7 BPO & Technical Support Hub',
    period: 'Sep 01 — Sep 15, 2026',
    businessName: 'Nexis Customer Experience BPO Inc.',
    tag: 'Attendance Incentives + De Minimis Tax Shielding',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#87a285',
    badgeText: 'PEZA / Tax Exemption Validated',
    employeeCount: 118,
    totalGross: 2890000,
    totalDeductions: 412500,
    totalNet: 2477500,
    currencySymbol: '₱',
    exceptions: [
      {
        author: 'WFM Team Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        text: 'Zero-tardiness perfect attendance allowance released for 74 agents.',
        category: 'allowance',
        timeAgo: '18m ago',
        position: { x: 52, y: 28 },
      },
    ],
  },
  {
    id: 'executive-group',
    name: 'Executive & Multi-Entity Hub',
    period: 'Monthly • Sep 2026',
    businessName: 'Vesper Capital Partners',
    tag: 'Tax-Shielded Allowances + Direct Bank Advice',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#435641',
    badgeText: 'Bank Batch Generated',
    employeeCount: 14,
    totalGross: 1850000,
    totalDeductions: 342000,
    totalNet: 1508000,
    currencySymbol: '₱',
    exceptions: [
      {
        author: 'Disbursal Officer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        text: 'BPI BizLink and BDO corporate disbursement hash confirmed.',
        category: 'approval',
        timeAgo: '8m ago',
        position: { x: 50, y: 48 },
      },
    ],
  },
];

export interface Benefit {
  number: string;
  title: string;
  tagline: string;
  description: string;
  metrics: string;
}

export const PRODUCT_BENEFITS: Benefit[] = [
  {
    number: '01',
    title: '100% Deterministic Engine',
    tagline: 'Zero rounding discrepancies or mystery math',
    description:
      'All calculations are driven by formula rules and snapshotted into permanent, audit-proof records. Historical payslips remain forever unchanged even if tax laws or compensation policies evolve later.',
    metrics: 'Zero audit variance',
  },
  {
    number: '02',
    title: 'Pinpoint Collaborative Audit',
    tagline: 'Exceptions resolved directly on the line item',
    description:
      'No more disconnected spreadsheets or frantic email chains. Leave timestamped audit notes, attach overtime proofs, and flag exceptions directly on the employee’s pay item before final sign-off.',
    metrics: '3.8x faster reconciliation',
  },
  {
    number: '03',
    title: 'Frictionless Employee Access',
    tagline: 'Digital payslips your team will actually appreciate',
    description:
      'Employees receive instant, password-protected PDF payslips or access their self-service portal to review earnings, tax breakdowns, and loan amortizations directly on their phone.',
    metrics: '100% mobile ESS adoption',
  },
];

export interface WorkforceIndustry {
  title: string;
  focus: string;
  highlight: string;
  avatar: string;
}

export const WORKFORCE_INDUSTRIES: WorkforceIndustry[] = [
  {
    title: 'Healthcare & Hospitals',
    focus: 'Rotating Shifts, Hazard Pay, Hazard Duty Deductions',
    highlight: 'DOH/PhilHealth compliance',
    avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'Retail & Convenience Chains',
    focus: 'Hourly DTR, Night Differential, Multi-Branch Shifts',
    highlight: 'Biometric timesheet sync',
    avatar: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'BPO & Contact Centers',
    focus: '24/7 Operations, Graveyard Differentials, Attendance Bonus',
    highlight: 'Automated tax shielding',
    avatar: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'Construction & Engineering',
    focus: 'Daily-Rate Workers, Project Cost Centers, Equipment Allowance',
    highlight: 'Site-based payroll',
    avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'Restaurant & F&B Groups',
    focus: 'Service Charge Pooling, Split-Shift Differentials, Tip Disbursal',
    highlight: 'DOLE RA 11360 rules',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'Logistics & Courier Fleets',
    focus: 'Trip-Based Commissions, Per Diem Fuel, Route Incentives',
    highlight: 'Hybrid wage calculation',
    avatar: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'Creative Studios & Agencies',
    focus: 'Retainers, Project Bonuses, Contractor Payouts',
    highlight: 'Flexible payroll runs',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80',
  },
  {
    title: 'Professional Law & Accounting Firms',
    focus: 'Time-and-Materials, Multi-Level Review, Bank Hash',
    highlight: 'Maker-checker security',
    avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&q=80',
  },
];

export interface WorkflowStage {
  id: string;
  title: string;
  badge: string;
  description: string;
  bullets: string[];
  image: string;
  statLabel: string;
  statValue: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'capture',
    title: 'Capture',
    badge: 'Stage 1 — Attendance & Inputs',
    description:
      'Consolidate time records, leave requests, night differentials, and bonus adjustments into a unified workspace without CSV wrangling.',
    bullets: [
      'Direct sync with biometric clocks and web attendance records',
      'Automatic calculation of tardiness, undertime, and leave without pay',
      'Overtime pre-validation against department budgets',
    ],
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    statLabel: 'Timesheets Processed',
    statValue: '25,000+/mo',
  },
  {
    id: 'reconcile',
    title: 'Reconcile',
    badge: 'Stage 2 — Calculation & Compliance',
    description:
      'Run deterministic calculations against up-to-date Philippine statutory contribution brackets and BIR TRAIN graduated tax tables.',
    bullets: [
      'Exact SSS Monthly Salary Credit (MSC) and WISP split calculation',
      'PhilHealth 5% tiered rate with employer 50/50 matching',
      'Pag-IBIG mandatory and voluntary MP2 deductions',
      'Graduated withholding tax computed automatically with ₱90K exemption threshold',
    ],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    statLabel: 'Calculation Speed',
    statValue: '< 1.2s per run',
  },
  {
    id: 'disburse',
    title: 'Disburse',
    badge: 'Stage 3 — Payment & Compliance Filing',
    description:
      'Generate corporate bank advice files, distribute encrypted digital payslips, and download pre-formatted government remittance returns.',
    bullets: [
      '1-click batch payroll advice file generation (BDO, BPI BizLink, Metrobank, UnionBank)',
      'Individual password-encrypted PDF payslips sent via email or employee portal',
      'Pre-formatted export for BIR Form 1601-C, 2316, SSS R-3, and PhilHealth EPRS',
    ],
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    statLabel: 'On-Time Disbursement',
    statValue: '99.98%',
  },
];

export interface PayrollRuleTemplate {
  id: string;
  title: string;
  category: 'All' | 'Statutory Compliance' | 'Shift & Overtime' | 'Benefits & Allowances' | 'Year-End 13th Month';
  authority: string;
  summary: string;
  formula: string;
  tags: string[];
  deliverables: string[];
}

export const PAYROLL_TEMPLATES: PayrollRuleTemplate[] = [
  {
    id: 'stat-ph',
    title: 'Philippine Statutory Triad (SSS, PhilHealth, HDMF)',
    category: 'Statutory Compliance',
    authority: 'SSS Circular / PhilHealth / Pag-IBIG Fund',
    summary: 'Automated tiered contribution matrix covering revised Monthly Salary Credits, PhilHealth 5% floor/ceiling, and Pag-IBIG ₱200 cap with employer share tracking.',
    formula: 'EE_Share + ER_Share computed dynamically from Basic Monthly Rate',
    tags: ['SSS', 'PhilHealth', 'Pag-IBIG', 'Statutory'],
    deliverables: ['Automated Remittance CSV', 'Employer Cost Summary', 'Quarterly R-3 Report'],
  },
  {
    id: 'train-tax',
    title: 'BIR TRAIN Withholding Tax Matrix',
    category: 'Statutory Compliance',
    authority: 'Bureau of Internal Revenue (R.A. 10963)',
    summary: 'Graduated tax schedule for Daily, Semi-Monthly, and Monthly compensation periods. Computes taxable income net of mandatory statutory contributions.',
    formula: 'Tax = Base_Tax + Rate * (Taxable_Income - Bracket_Threshold)',
    tags: ['BIR', 'TRAIN Law', 'Withholding Tax', '1601-C'],
    deliverables: ['BIR 1601-C Schedule', 'Annualized 2316 Form', 'Tax Refund Adjuster'],
  },
  {
    id: 'regular-ot',
    title: 'Standard Overtime & Night Shift Differential',
    category: 'Shift & Overtime',
    authority: 'DOLE Labor Code Book III',
    summary: 'Pre-configured multipliers: Regular OT (125%), Rest Day OT (130%), and Night Shift Differential (10% for 10 PM to 6 AM shifts).',
    formula: 'Hourly_Rate * 1.25 * OT_Hours + Hourly_Rate * 0.10 * Night_Hours',
    tags: ['Overtime', 'Night Diff', 'DTR', 'DOLE'],
    deliverables: ['Overtime Verification Ledger', 'Shift Discrepancy Log', 'Department OT Chart'],
  },
  {
    id: 'holiday-matrix',
    title: 'Special & Regular Holiday Multiplier Engine',
    category: 'Shift & Overtime',
    authority: 'Proclamation / DOLE Advisory',
    summary: 'Handles Regular Holiday unworked (100%), Regular Holiday worked (200%), Special Non-Working Day (130%), and Double Holiday combinations.',
    formula: 'Daily_Rate * Multiplier (1.30 to 2.60 depending on holiday type)',
    tags: ['Holidays', 'DOLE', 'Rest Day', 'Premium Pay'],
    deliverables: ['Calendar Holiday Sync', 'Worked Holiday Audit', 'Payroll Variance Alert'],
  },
  {
    id: 'de-minimis',
    title: 'Tax-Exempt De Minimis & Rice Subsidy',
    category: 'Benefits & Allowances',
    authority: 'BIR Revenue Regulations No. 5-2011 / 11-2018',
    summary: 'Categorizes non-taxable allowances (Rice subsidy up to ₱2,000/mo, Uniform allowance up to ₱6,000/yr, Medical cash allowances) keeping employees tax-optimized.',
    formula: 'Amount <= De_Minimis_Cap ? NonTaxable : Taxable_Excess',
    tags: ['De Minimis', 'Tax Shield', 'Rice Subsidy', 'Benefits'],
    deliverables: ['De Minimis Cap Monitor', 'Allowance Ledger', 'Tax Optimization Audit'],
  },
  {
    id: '13th-month',
    title: '13th Month Pay Annualized Engine',
    category: 'Year-End 13th Month',
    authority: 'Presidential Decree No. 851',
    summary: 'Accumulates basic salary earned across the calendar year divided by 12, factoring in mid-year hires and the ₱90,000 statutory tax exemption ceiling.',
    formula: '(Total_Basic_Salary_Earned_In_Year) / 12',
    tags: ['13th Month', 'Year End', 'PD 851', '90k Exemption'],
    deliverables: ['Year-End Disbursal Advice', 'BIR 2316 Exemption Schedule', 'Proration Ledger'],
  },
];

export interface PricingPlan {
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Single Business',
    currency: '₱',
    priceMonthly: 999,
    priceAnnual: 799,
    description: 'For growing small businesses, tech startups, and independent studios up to 25 employees.',
    features: [
      '1 Active Business Entity / Company',
      'Up to 25 Active Employees included',
      'Automated SSS, PhilHealth, Pag-IBIG & BIR Tax engine',
      'Digital password-protected PDF payslips via email',
      'Standard Semi-Monthly & Monthly pay schedules',
      'Exportable BDO, BPI, and UnionBank advice CSVs',
      'Historical payroll recalculation and immutable snapshots',
      'Standard email and community support',
    ],
    cta: 'Register Single Business',
    highlight: false,
  },
  {
    name: 'Multi-Entity Group',
    badge: 'Recommended for Groups',
    currency: '₱',
    priceMonthly: 2499,
    priceAnnual: 1999,
    description: 'For corporate groups, multi-branch franchises, and agencies managing multiple payroll entities.',
    features: [
      'Unlimited Business Entities & Subsidiaries',
      'Up to 150 Active Employees included (expandable)',
      'Multi-tier Maker-Checker approvals & audit logs',
      'Employee Self-Service (ESS) portal for payslips & leaves',
      'Biometric DTR & timesheet automatic reconciliation',
      'Custom allowances, loan amortization & cash advance ledgers',
      '1-click BIR Form 1601-C, 2316 & SSS R-3 compliance files',
      'Dedicated payroll implementation specialist & Slack support',
    ],
    cta: 'Register Multi-Entity Group',
    highlight: true,
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: 'How are Philippine statutory contributions (SSS, PhilHealth, Pag-IBIG) calculated?',
    answer:
      'ShinPay+ maintains built-in, automated contribution matrices reflecting the latest PhilHealth 5% tiered rates (with ₱10,000 floor and ₱100,000 ceiling), updated SSS Monthly Salary Credit (MSC) brackets with WISP / Mandatory Provident Fund, and Pag-IBIG mandatory ₱200 caps. Both Employee (EE) and Employer (ER) shares are computed automatically per cut-off.',
  },
  {
    question: 'Can I generate corporate bank disbursement files for BDO, BPI, or UnionBank?',
    answer:
      'Yes. Once a payroll run is finalized, you can export pre-formatted batch advice files compatible with major Philippine corporate banking portals (including BPI BizLink, BDO PayLink/Direct Credit, Metrobank, and UnionBank The Portal).',
  },
  {
    question: 'How do immutable historical snapshots work?',
    answer:
      'When you finalize a payroll period, the engine freezes every calculation, deduction, earning, and tax bracket into permanent snapshot tables (payroll_items, payroll_item_earnings, and payroll_item_deductions). If you change an employee salary or update tax rates next month, past payslips and reports remain 100% untouched and audit-compliant.',
  },
  {
    question: 'Does ShinPay+ support loan amortizations and cash advances?',
    answer:
      'Yes! You can configure employee loans (SSS salary loan, Pag-IBIG calamity loan, or internal company emergency loans) with total principal balances. The engine automatically deducts the amortized amount per cut-off and stops automatically once the remaining balance reaches zero.',
  },
  {
    question: 'Can employees view their payslips on mobile without seeing other company data?',
    answer:
      'Absolutely. Employees receive secure, password-protected PDF payslips or can log into their Employee Self-Service (ESS) portal where they only see their personal compensation details, year-to-date statutory contributions, and BIR 2316 certificates.',
  },
];

