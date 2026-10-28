import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Globe,
  FileCode2,
  ExternalLink,
  Copy,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Node } from '@xyflow/react';

interface ResourceInspectorDrawerProps {
  node: Node | null;
  onClose: () => void;
  onJumpToCode: (fileName: string) => void;
}

export const ResourceInspectorDrawer: React.FC<ResourceInspectorDrawerProps> = ({
  node,
  onClose,
  onJumpToCode,
}) => {
  const [copiedArn, setCopiedArn] = React.useState(false);

  if (!node) return null;

  const data = node.data || {};
  const label = (data.label as string) || node.id;
  const service = (data.service as string) || 'Service';
  const category = (data.category as string) || 'AWS Resource';
  const arn = (data.arn as string) || `arn:aws:${service}:us-east-1:123456789012:${node.id}`;
  const details = (data.details as string) || 'Resource declared and managed via TerraGen AI.';
  const targetFile = (data.file as string) || 'main.tf';

  const handleCopyArn = () => {
    navigator.clipboard.writeText(arn);
    setCopiedArn(true);
    setTimeout(() => setCopiedArn(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0B1020]/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#080C18]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Resource Inspector
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        
        {/* Title Lockup */}
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider block">
            {category}
          </span>
          <h3 className="text-base font-bold text-white mt-1 break-words">
            {label}
          </h3>
          <p className="text-slate-300 mt-2 leading-relaxed">
            {details}
          </p>
        </div>

        {/* ARN Block */}
        <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Resource ARN</span>
            <button
              type="button"
              onClick={handleCopyArn}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedArn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedArn ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-200 break-all select-text">
            {arn}
          </p>
        </div>

        {/* Security & Isolation Badges */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Security &amp; Network Posture
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[10px] font-mono text-emerald-300 font-semibold">
                  Least-Privilege
                </span>
                <span className="block text-[9px] text-slate-400 font-mono">
                  Zero Wildcards
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="block text-[10px] font-mono text-cyan-300 font-semibold">
                  Encryption
                </span>
                <span className="block text-[9px] text-slate-400 font-mono">
                  Default Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Metadata */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Terraform Declaration
          </span>
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Target File:</span>
              <span className="text-cyan-300">{targetFile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Provider:</span>
              <span className="text-slate-200">hashicorp/aws</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Node ID:</span>
              <span className="text-slate-200">{node.id}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Drawer Footer with "Jump to Code" */}
      <div className="p-4 border-t border-white/10 bg-[#080C18]">
        <button
          type="button"
          onClick={() => {
            onJumpToCode(targetFile);
            onClose();
          }}
          className="glow-button w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg cursor-pointer"
        >
          <FileCode2 className="w-4 h-4" />
          <span>Open in Terraform Code ({targetFile})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
