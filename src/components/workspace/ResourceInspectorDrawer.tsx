import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  FileCode2,
  Copy,
  Check,
  ArrowRight,
  Network,
} from 'lucide-react';
import { AwsResourceItem } from '../../types/workspace';
import { AwsServiceIcon, AWS_ICON_META } from './AwsServiceIcon';

interface ResourceInspectorDrawerProps {
  resource: AwsResourceItem | null;
  onClose: () => void;
  onOpenInTerraformCode: (resource: AwsResourceItem) => void;
}

export const ResourceInspectorDrawer: React.FC<ResourceInspectorDrawerProps> = ({
  resource,
  onClose,
  onOpenInTerraformCode,
}) => {
  const [copiedArn, setCopiedArn] = useState(false);

  if (!resource) return null;

  const meta = AWS_ICON_META[resource.iconKey] || AWS_ICON_META.vpc;

  const handleCopyArn = () => {
    navigator.clipboard.writeText(resource.arn);
    setCopiedArn(true);
    setTimeout(() => setCopiedArn(false), 2000);
  };

  const attributeEntries = Object.entries(resource.attributes || {});

  return (
    <aside
      aria-label="AWS Resource Inspector"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#090E1D]/98 border-l border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col select-none"
    >
      {/* Inspector Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#070A15]">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="font-semibold text-white">Resource Inspector</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-slate-400">Simulated HCL Model</span>
        </div>
        <button
          type="button"
          aria-label="Close Resource Inspector"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* AWS Logo + Resource Name & Type */}
        <div className="flex items-start gap-3.5">
          <AwsServiceIcon iconKey={resource.iconKey} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-mono text-cyan-300">{meta.title}</div>
            <h3 className="text-base font-bold text-white mt-0.5 truncate">
              {resource.name}
            </h3>
            <div className="mt-1 font-mono text-[11px] text-indigo-300 break-all">
              {resource.terraformAddress}
            </div>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">{resource.details}</p>

        {/* Configuration Attributes */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200">
            Resource Configuration
          </h4>
          <div className="rounded-xl bg-[#060913] border border-white/10 divide-y divide-white/5 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-3 px-3.5 py-2">
              <span className="text-slate-400">terraform_type</span>
              <span className="text-cyan-300 truncate">{resource.type}</span>
            </div>
            {attributeEntries.map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 px-3.5 py-2"
              >
                <span className="text-slate-400">{key}</span>
                <span className="text-slate-100 tabular-nums text-right truncate max-w-[210px]">
                  {typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Posture */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200">
            Security Posture
          </h4>
          <div className="rounded-xl bg-[#060913] border border-white/10 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Encryption</span>
              </span>
              <span className="text-slate-100 font-medium">
                {resource.encryption === 'kms'
                  ? 'AWS KMS (CMK)'
                  : resource.encryption === 'default'
                  ? 'Default SSE Encrypted'
                  : 'Network / Policy Plane'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                <span>Network Exposure</span>
              </span>
              <span
                className={
                  resource.exposure === 'private'
                    ? 'text-emerald-300 font-medium'
                    : 'text-amber-300 font-medium'
                }
              >
                {resource.exposure === 'private'
                  ? 'Private / Isolated'
                  : 'Controlled Edge Perimeter'}
              </span>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-[11px] font-mono text-emerald-300/95">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{resource.securitySummary}</span>
            </div>
          </div>
        </div>

        {/* Simulated ARN Placeholder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-200">
              ARN Placeholder <span className="text-slate-400 font-normal">(Simulated)</span>
            </h4>
            <button
              type="button"
              onClick={handleCopyArn}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedArn ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedArn ? 'Copied' : 'Copy ARN'}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-[#060913] border border-white/10 font-mono text-[11px] text-slate-300 break-all select-text">
            {resource.arn}
            <div className="mt-1.5 text-[10px] text-slate-500">
              Account 000000000000 indicates offline HCL simulation — not connected to live AWS.
            </div>
          </div>
        </div>

        {/* Linked Terraform File & Line Range */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-200">
            Linked Terraform Source
          </h4>
          <div className="rounded-xl bg-[#060913] border border-white/10 px-3.5 py-2.5 flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-2 text-cyan-300">
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{resource.file}</span>
            </div>
            <span className="text-slate-400 tabular-nums">
              Lines {resource.lineNumber}&ndash;{resource.endLine}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action: Open in Terraform Code */}
      <div className="p-4 border-t border-white/10 bg-[#070A15]">
        <button
          type="button"
          onClick={() => {
            onOpenInTerraformCode(resource);
            onClose();
          }}
          className="glow-button w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 px-4 text-xs font-semibold text-white shadow-lg cursor-pointer"
        >
          <FileCode2 className="w-4 h-4 shrink-0" />
          <span>Open in Terraform Code</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </aside>
  );
};
