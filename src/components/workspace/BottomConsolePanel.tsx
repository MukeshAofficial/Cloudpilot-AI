import React, { useState } from 'react';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Play,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  FileCode2,
  Trash2,
} from 'lucide-react';
import { BottomPanelTab } from '../../types/workspace';

interface BottomConsolePanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: BottomPanelTab;
  onSelectTab: (tab: BottomPanelTab) => void;
  fmtOutput: string;
  validateOutput: string;
  securityOutput: string;
  onRunFormat: () => void;
  onRunValidate: () => void;
  onRunSecurity: () => void;
}

export const BottomConsolePanel: React.FC<BottomConsolePanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  fmtOutput,
  validateOutput,
  securityOutput,
  onRunFormat,
  onRunValidate,
  onRunSecurity,
}) => {
  return (
    <div
      className={`border-t border-white/10 bg-[#060810] flex flex-col transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'h-9' : 'h-52'
      }`}
    >
      {/* Panel Tab Bar */}
      <div className="h-9 px-3 border-b border-white/10 flex items-center justify-between bg-[#070A14] shrink-0">
        <div className="flex items-center gap-1">
          {/* Tabs */}
          {[
            { id: 'fmt', label: 'terraform fmt' },
            { id: 'validate', label: 'terraform validate' },
            { id: 'security', label: 'Security Scan' },
            { id: 'recommendations', label: 'Recommendations' },
            { id: 'output', label: 'Execution Logs' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id as BottomPanelTab);
                  if (isCollapsed) onToggleCollapse();
                }}
                className={`px-3 py-1 text-xs font-mono rounded-t transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1020] text-cyan-300 font-semibold border-t border-x border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Status & Collapse Toggle */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
          <span className="hidden sm:inline text-[11px] text-slate-400">
            Simulated Execution · Read-Only Sandbox
          </span>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand Console Panel' : 'Collapse Console Panel'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Panel Content (only visible when expanded) */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 bg-[#05070F] font-mono text-xs text-slate-300">
          {activeTab === 'fmt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>$ terraform fmt -recursive -check=false</span>
                <button
                  type="button"
                  onClick={onRunFormat}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 cursor-pointer"
                >
                  Run terraform fmt
                </button>
              </div>
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                {fmtOutput || 'No formatting needed. All .tf files are properly canonicalized.'}
              </pre>
            </div>
          )}

          {activeTab === 'validate' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>$ terraform validate -json</span>
                <button
                  type="button"
                  onClick={onRunValidate}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-emerald-300 hover:bg-white/10 cursor-pointer"
                >
                  Run validate
                </button>
              </div>
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                {validateOutput || 'Success! The configuration is valid with 0 errors.'}
              </pre>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>$ tfsec --format default --concise</span>
                <button
                  type="button"
                  onClick={onRunSecurity}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 cursor-pointer"
                >
                  Run tfsec Scan
                </button>
              </div>
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                {securityOutput || 'CIS AWS Benchmark Scan completed. 4 passed, 0 failed, 0 critical issues.'}
              </pre>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Cost Optimization: Enable S3 Bucket Keying</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  Enabling bucket keys on KMS-encrypted S3 buckets reduces API call frequency to AWS KMS by up to 99%.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Reliability: Multi-AZ Subnet Redundancy</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  Ensure all private database and compute tiers span at least two availability zones to tolerate regional failovers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="space-y-1 text-slate-400 font-mono text-[11px]">
              <div>[system] TerraGen AI Workspace loaded successfully.</div>
              <div>[runtime] AWS Provider schema loaded (~&gt; 5.40).</div>
              <div>[sync] Architecture diagram node graph synchronized with HCL declarations.</div>
              <div>[ready] Listening for architectural prompts.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
