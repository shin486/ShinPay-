import type { LucideIcon } from 'lucide-react';
import { Zap, Users, FileText } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Payroll Processing',
    description: 'Calculate employee earnings and deductions with ease.',
  },
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Manage employee information and compensation from one place.',
  },
  {
    icon: FileText,
    title: 'Digital Payslips',
    description: 'Generate professional payslips for every payroll period.',
  },
];

export interface Stat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const STATS: Stat[] = [
  { label: 'Total Businesses', value: 4 },
  { label: 'Active Employees', value: 42 },
  { label: 'Current Payroll', value: 582, prefix: '₱', suffix: 'K' },
  { label: 'Net Payroll', value: 521, prefix: '₱', suffix: 'K' },
];

export type PricingHighlight = boolean;

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight: PricingHighlight;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '₱0',
    period: '/month',
    description: 'For small businesses getting started.',
    features: ['Up to 10 employees', '1 business', 'Basic payroll', 'Email support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '₱999',
    period: '/month',
    description: 'For growing businesses.',
    features: ['Up to 50 employees', '3 businesses', 'Advanced payroll', 'Priority support', 'Reports'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: '₱2,499',
    period: '/month',
    description: 'For businesses with larger teams.',
    features: ['Up to 200 employees', '10 businesses', 'All payroll features', 'API access', 'Dedicated support'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations requiring custom solutions.',
    features: ['Unlimited employees', 'Unlimited businesses', 'Custom integrations', 'SLA', 'On-premise option'],
    cta: 'Contact Sales',
    highlight: false,
  },
];