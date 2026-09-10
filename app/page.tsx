'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DynamicBackground } from '@/components/sparkdesign/DynamicBackground';
import { Navbar } from '@/components/sparkdesign/Navbar';
import { PhotographicHero } from '@/components/sparkdesign/PhotographicHero';
import { IntegrationBadgeBar } from '@/components/sparkdesign/IntegrationBadgeBar';
import { ProductBenefits } from '@/components/sparkdesign/ProductBenefits';
import { BeforeAfterComparison } from '@/components/sparkdesign/BeforeAfterComparison';
import { CreativeRoleRows } from '@/components/sparkdesign/CreativeRoleRows';
import { FeatureTabs } from '@/components/sparkdesign/FeatureTabs';
import { WorkflowTabs } from '@/components/sparkdesign/WorkflowTabs';
import { CollaborationStory } from '@/components/sparkdesign/CollaborationStory';
import { ProjectLibrary } from '@/components/sparkdesign/ProjectLibrary';
import { PricingPlans } from '@/components/sparkdesign/PricingPlans';
import { WorkspaceDemo } from '@/components/sparkdesign/WorkspaceDemo';
import { ClosingSignup } from '@/components/sparkdesign/ClosingSignup';
import { Footer } from '@/components/sparkdesign/Footer';
import { type PayrollDemoConfig, DEFAULT_DEMO_CONFIG } from '@/components/sparkdesign/data';

export default function LandingPage() {
  const [demoConfig, setDemoConfig] = useState<PayrollDemoConfig>(DEFAULT_DEMO_CONFIG);
  const [highlightNonce, setHighlightNonce] = useState(0);

  const handleCalculateDemo = (config: PayrollDemoConfig) => {
    setDemoConfig(config);
    setHighlightNonce((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-[#fafbfa] text-slate-800 antialiased dark:bg-[#0c100d] dark:text-slate-100 font-sans selection:bg-sage-200 selection:text-sage-900 dark:selection:bg-sage-800 dark:selection:text-sage-100 overflow-x-hidden">
      <DynamicBackground />
      <Navbar />
      <main className="relative z-10">
        <PhotographicHero onCalculateDemo={handleCalculateDemo} />
        <IntegrationBadgeBar />
        <ProductBenefits />
        <BeforeAfterComparison />
        <CreativeRoleRows />
        <FeatureTabs />
        <WorkflowTabs />
        <CollaborationStory />
        <ProjectLibrary />
        <PricingPlans />
        <WorkspaceDemo demoConfig={demoConfig} highlightNonce={highlightNonce} />
        <ClosingSignup />
      </main>
      <Footer />
    </div>
  );
}