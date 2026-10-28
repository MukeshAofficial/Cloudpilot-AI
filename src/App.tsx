/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CloudTalkSection } from './components/CloudTalkSection';
import { TerraGenSection } from './components/TerraGenSection';
import { HowItWorks } from './components/HowItWorks';
import { ClosingCTA } from './components/ClosingCTA';
import { Footer } from './components/Footer';
import { InstantAccessModal } from './components/InstantAccessModal';
import { LegalModal } from './components/LegalModal';

export default function App() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  const handleSelectPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar onOpenAccess={() => setIsAccessModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenAccess={() => setIsAccessModalOpen(true)}
          onSelectPrompt={handleSelectPrompt}
        />

        {/* Feature 01: CloudTalk */}
        <CloudTalkSection
          onOpenAccess={() => setIsAccessModalOpen(true)}
        />

        {/* Feature 02: TerraGen */}
        <TerraGenSection
          onOpenAccess={() => setIsAccessModalOpen(true)}
        />

        {/* Pipeline / How It Works */}
        <HowItWorks />

        {/* Closing Action CTA */}
        <ClosingCTA
          onOpenAccess={() => setIsAccessModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenAccess={() => setIsAccessModalOpen(true)}
      />

      {/* Interactive Instant Access Early Access Modal */}
      <InstantAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />

      {/* Legal Privacy & Terms Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
