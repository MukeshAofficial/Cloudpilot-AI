import React from 'react';
import { ArrowDown, Sparkles, Shield, Lock, Terminal, CheckCircle } from 'lucide-react';
import { CloudVisual } from './CloudVisual';

interface HeroProps {
  onOpenAccess: () => void;
  onSelectPrompt: (prompt: string) => void;
  onOpenWorkspace?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAccess, onSelectPrompt, onOpenWorkspace }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-10 -z-10 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Headline, Value Proposition, and Action CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Clean unboxed metadata lead-in */}
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-cyan-400 font-mono">
              <span>Next-Gen Cloud Intelligence</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>AWS &amp; Terraform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] [text-wrap:balance]">
              Build, Control, and Fix Your Cloud with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Simple Words.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl">
              The intelligent AWS companion that translates human intent into live cloud operations, rapid incident error diagnostics, and production-ready Terraform with uncompromising security defaults.
            </p>

            {/* Interactive CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Primary: Go to CloudTalk */}
              <a
                href="#cloudtalk"
                className="glow-button inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Go to CloudTalk</span>
                <ArrowDown className="h-4 w-4" />
              </a>

              {/* Secondary: Go to TerraGen */}
              {onOpenWorkspace ? (
                <button
                  type="button"
                  onClick={onOpenWorkspace}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-5 py-3.5 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Launch TerraGen Workspace</span>
                </button>
              ) : (
                <a
                  href="#terragen"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-5 py-3.5 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Go to TerraGen</span>
                  <ArrowDown className="h-4 w-4 text-indigo-400" />
                </a>
              )}

              {/* Get Instant Access */}
              <button
                type="button"
                onClick={onOpenAccess}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:border-cyan-400/40 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Get Instant Access</span>
              </button>
            </div>

            {/* Trust and Safety Indicators (Clean unboxed text, no fake user counts) */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero-credential local evaluation</span>
              </div>
              <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Read-only IAM role support</span>
              </div>
              <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero wildcard statements</span>
              </div>
            </div>
          </div>

          {/* Right Column: Original Animated Cloud/AI Visual */}
          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <CloudVisual onSelectServicePrompt={onSelectPrompt} />
          </div>

        </div>
      </div>
    </section>
  );
};
