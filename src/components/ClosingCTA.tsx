import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

interface ClosingCTAProps {
  onOpenAccess: () => void;
}

export const ClosingCTA: React.FC<ClosingCTAProps> = ({ onOpenAccess }) => {
  return (
    <section className="relative py-24 overflow-hidden border-t border-white/5 bg-[#06080F]">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-sky-500/10 to-indigo-500/15 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-white/10 bg-[#0B1020]/90 backdrop-blur-2xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          {/* Subtle glowing accent border line on top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500" />

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
            Ready to retire the AWS CLI manual?
          </h2>

          {/* Supplied Supporting Copy */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn complex cloud infrastructure into clear conversations. Generate compliant Terraform and diagnose live incidents in seconds.
          </p>

          {/* CTA Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenAccess}
              className="glow-button w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Get Instant Access</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Trial & Setup Notes */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Zero-credential local evaluation</span>
            </span>
            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Read-only IAM role support</span>
            </span>
            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>SOC2 Type II compliant roadmap</span>
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
