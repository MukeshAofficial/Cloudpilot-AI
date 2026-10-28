import React, { useState } from 'react';
import { Cloud, ArrowUp, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAccess: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onOpenAccess }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#06B6D4', '#38BDF8', '#6366F1'],
    });
  };

  return (
    <footer className="border-t border-white/10 bg-[#04060C] text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-12">
        
        {/* Top Newsletter / Access Strip */}
        <div className="pb-12 border-b border-white/5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0E1A]">
                  <Cloud className="h-4.5 w-4.5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                CloudPilot <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              The intelligent AWS companion. Translating human language into operational cloud insights and certified Terraform infrastructure.
            </p>
          </div>

          {/* Quick Subscribe Form */}
          <div className="w-full lg:w-auto">
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your engineering email..."
                  required
                  className="w-full sm:w-72 rounded-xl bg-black/60 border border-white/15 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto glow-button flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                >
                  <span>Stay Updated</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Subscribed! Developer release notes will be sent to your inbox.</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Navigation Columns */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/5">
          {/* Column 1: Core Product */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Core Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#cloudtalk" className="hover:text-cyan-400 transition-colors">
                  CloudTalk Natural Ops
                </a>
              </li>
              <li>
                <a href="#terragen" className="hover:text-cyan-400 transition-colors">
                  TerraGen HCL Synthesis
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  3-Stage Pipeline
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAccess}
                  className="hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Early Access Program
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Capabilities */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-slate-300">Cascade Error Tracing</span>
              </li>
              <li>
                <span className="text-slate-300">VPC Flow Log Analysis</span>
              </li>
              <li>
                <span className="text-slate-300">Customer KMS Encryption</span>
              </li>
              <li>
                <span className="text-slate-300">Least-Privilege IAM Scoping</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Security & Governance */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Security &amp; Safety
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-slate-300">Zero Credential Retention</span>
              </li>
              <li>
                <span className="text-slate-300">Read-Only Assumed Roles</span>
              </li>
              <li>
                <span className="text-slate-300">SOC2 Type II Roadmap</span>
              </li>
              <li>
                <span className="text-slate-300">CIS Benchmark Compliance</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policy */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Governance &amp; Terms
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Architecture Overview
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>&copy; 2026 CloudPilot AI. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Operational · AWS Intelligence Engine</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenAccess}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Get Instant Access
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              aria-label="Scroll back to top"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 hover:text-white transition-all cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
