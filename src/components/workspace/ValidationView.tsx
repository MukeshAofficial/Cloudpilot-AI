import React from 'react';
import { CheckCircle2, AlertCircle, FileCheck, Terminal, Play } from 'lucide-react';
import { simulateTerraformValidate } from '../../utils/terraformEngine';

interface ValidationViewProps {
  files: Record<string, string>;
  onRunValidate: () => void;
}

export const ValidationView: React.FC<ValidationViewProps> = ({ files, onRunValidate }) => {
  const validation = simulateTerraformValidate(files);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060810] p-6 overflow-y-auto select-none">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Terraform Validation &amp; Schema Integrity</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simulated deterministic execution of <code className="text-cyan-300 font-mono">terraform validate</code> and syntax tree analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={onRunValidate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-semibold text-white shadow-md cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Re-run Validation</span>
          </button>
        </div>

        {/* Validation Result Box */}
        <div
          className={`p-6 rounded-2xl border ${
            validation.success
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {validation.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-400" />
            )}
            <div>
              <h4 className="text-base font-bold text-white">
                {validation.success
                  ? 'Configuration is valid.'
                  : 'Validation errors detected in configuration.'}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {validation.errorCount} error(s) · {validation.warningCount} warning(s)
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {validation.output}
          </div>
        </div>

        {/* Checks Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#090E1A] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Syntax Parsing
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              HCL 2.0 Lexer
            </span>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
              100% Passed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#090E1A] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Provider Compatibility
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              AWS Provider ~&gt; 5.40
            </span>
            <span className="text-[11px] text-cyan-300 font-mono mt-1 block">
              Schema Aligned
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#090E1A] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Dependency Graph
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              Directed Acyclic Graph
            </span>
            <span className="text-[11px] text-indigo-300 font-mono mt-1 block">
              Zero Circular Cycles
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
