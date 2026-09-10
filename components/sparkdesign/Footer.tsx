'use client';

import Link from 'next/link';
import { ArrowUp, Banknote, ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-sage-200 dark:border-sage-900 bg-white dark:bg-[#0c100d] pt-16 pb-12 text-slate-600 dark:text-slate-400 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-sage-100 dark:border-sage-900">
          
          {/* Brand Col */}
          <div className="col-span-2">
            <Link href="#overview" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-600 text-white shadow-sm">
                <Banknote className="h-4 w-4" />
              </div>
              <span className="font-sans text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                ShinPay+
              </span>
            </Link>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              A collaborative, tactile payroll workspace engineered for growing businesses, creative studios, and multi-branch enterprises. Built with Instrument Sans and soft sage design tokens.
            </p>
            <div className="mt-4 flex items-center gap-3 text-slate-400">
              <a href="#" className="hover:text-sage-600 transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-sage-600 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-sage-600 transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nav Col 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><a href="#overview" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Hero Overview</a></li>
              <li><a href="#benefits" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Core Benefits</a></li>
              <li><a href="#features" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Capabilities</a></li>
              <li><a href="#workflow" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">3-Stage Workflow</a></li>
              <li><a href="#demo" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Live Sandbox</a></li>
            </ul>
          </div>

          {/* Nav Col 2: Compliance & Rules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              Compliance & Rules
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><a href="#library" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Statutory Matrices</a></li>
              <li><a href="#library" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">BIR TRAIN Tables</a></li>
              <li><a href="#library" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Overtime Multipliers</a></li>
              <li><a href="#pricing" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Pricing Plans</a></li>
              <li><Link href="/login" className="hover:text-sage-600 dark:hover:text-sage-300 transition-colors">Workspace Login</Link></li>
            </ul>
          </div>

          {/* Nav Col 3: Legal & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              Standards
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><span className="text-slate-400">BIR Form 1601-C & 2316</span></li>
              <li><span className="text-slate-400">SSS WISP & EC Split</span></li>
              <li><span className="text-slate-400">PhilHealth 5% Tiered</span></li>
              <li><span className="text-slate-400">Pag-IBIG / HDMF ₱200</span></li>
              <li><span className="text-slate-400">Data Privacy Act (R.A. 10173)</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} ShinPay+ / RA Payroll System. Designed with Instrument Sans and soft sage design tokens.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-full border border-sage-200 dark:border-sage-800 bg-sage-50/80 dark:bg-sage-950/60 px-3.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-sage-100 dark:hover:bg-sage-900 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}

