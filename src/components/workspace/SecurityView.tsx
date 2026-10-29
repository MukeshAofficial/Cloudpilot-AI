import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SecurityFinding } from '../../types/workspace';

interface SecurityViewProps {
  findings: SecurityFinding[];
  onRemediate: (prompt: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  findings,
  onRemediate,
}) => {
  const passedCount = findings.filter((f) => f.status === 'passed').length;
  const score = findings.length > 0 ? Math.round((passedCount / findings.length) * 100) : 100;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060810] p-6 overflow-y-auto select-none">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        
        {/* Security Posture Banner */}
        <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#0C152A] to-[#0A0E1A] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>CIS AWS Foundations Benchmark v3.0</span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-1">
              Automated Cloud Compliance &amp; Security Posture
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              TerraGen enforces least-privilege IAM scoping, zero wildcard rules, private subnet isolation, and customer-managed KMS encryption by default.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/50 border border-white/10 px-5 py-3 rounded-2xl">
            <div className="text-right">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">
                Posture Score
              </span>
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {score}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 flex items-center justify-center font-mono text-xs font-bold text-white">
              {passedCount}/{findings.length}
            </div>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Security Controls &amp; Invariants ({findings.length})
          </h4>

          {findings.map((finding) => {
            const isPassed = finding.status === 'passed';
            return (
              <div
                key={finding.id}
                className="p-4 rounded-xl border border-white/10 bg-[#0A0F1F] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isPassed
                          ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-950/80 border border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {finding.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      {finding.rule}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      · {finding.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {finding.description}
                  </p>
                </div>

                {!isPassed && finding.remediationPrompt && (
                  <button
                    type="button"
                    onClick={() => onRemediate(finding.remediationPrompt)}
                    className="glow-button shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fix with TerraGen AI</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
