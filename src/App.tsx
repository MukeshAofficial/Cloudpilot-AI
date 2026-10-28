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
import { TerraGenWorkspace } from './components/workspace/TerraGenWorkspace';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  const handleSelectPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  // If TerraGen AI Workspace is active, render the full IDE interface
  if (isWorkspaceOpen) {
    return (
      <TerraGenWorkspace
        onBackToLanding={() => setIsWorkspaceOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        onOpenAccess={() => setIsAccessModalOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenAccess={() => setIsAccessModalOpen(true)}
          onSelectPrompt={handleSelectPrompt}
          onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        />

        {/* Feature 01: CloudTalk */}
        <CloudTalkSection
          onOpenAccess={() => setIsAccessModalOpen(true)}
        />

        {/* Feature 02: TerraGen */}
        <TerraGenSection
          onOpenAccess={() => setIsAccessModalOpen(true)}
          onOpenWorkspace={() => setIsWorkspaceOpen(true)}
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

      {/* Floating Workspace Launch Dock Badge */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen(true)}
          className="glow-button flex items-center gap-2 rounded-2xl bg-[#0C1428] border border-cyan-400/50 px-4 py-2.5 text-xs font-mono font-semibold text-cyan-200 shadow-2xl backdrop-blur-xl hover:bg-[#121E3C] transition-all cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>TerraGen AI Workspace</span>
          <span className="text-[10px] text-cyan-400/70 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
            Open IDE
          </span>
        </button>
      </div>

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
