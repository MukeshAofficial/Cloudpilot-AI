import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1222] p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          aria-label="Close legal view"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'privacy' ? (
          <div className="space-y-4 text-slate-300 text-sm">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Security &amp; Data Privacy</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Privacy Policy</h3>
            <p className="text-xs text-slate-400 font-mono">Effective Date: January 1, 2026</p>

            <h4 className="text-base font-semibold text-white pt-2">1. Zero-Credential Architecture</h4>
            <p className="leading-relaxed">
              CloudPilot AI operates entirely on temporary STS tokens via customer-assumed IAM roles. We never request, store, or transmit long-lived AWS Access Keys, Secret Keys, or root credentials.
            </p>

            <h4 className="text-base font-semibold text-white pt-2">2. Local &amp; Private Telemetry</h4>
            <p className="leading-relaxed">
              All infrastructure queries and log analyses are processed in ephemeral sandboxes. CloudWatch log contents and VPC flow logs are parsed strictly to answer the user&apos;s prompt and are purged immediately post-session.
            </p>

            <h4 className="text-base font-semibold text-white pt-2">3. No Model Training on User Infrastructure</h4>
            <p className="leading-relaxed">
              Customer architecture graphs, internal resource identifiers, ARN structures, and generated Terraform files are never used to train generalized AI models.
            </p>

            <h4 className="text-base font-semibold text-white pt-2">4. SOC2 Compliance Alignment</h4>
            <p className="leading-relaxed">
              CloudPilot AI adheres to AICPA Trust Services Criteria for Security and Confidentiality.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-slate-300 text-sm">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Agreement &amp; Governance</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Terms of Service</h3>
            <p className="text-xs text-slate-400 font-mono">Last Updated: January 1, 2026</p>

            <h4 className="text-base font-semibold text-white pt-2">1. Usage Rights &amp; Access</h4>
            <p className="leading-relaxed">
              CloudPilot AI grants you a non-exclusive license to generate, inspect, and deploy Terraform configurations and query AWS environments connected through your own AWS authorization.
            </p>

            <h4 className="text-base font-semibold text-white pt-2">2. Infrastructure Safety &amp; Non-Destructive Defaults</h4>
            <p className="leading-relaxed">
              CloudTalk diagnostic queries run with read-only privileges by default. Any operational remediation commands (e.g. AWS CLI scripts or Terraform apply) require explicit manual confirmation by your cloud administrators.
            </p>

            <h4 className="text-base font-semibold text-white pt-2">3. Terraform Ownership</h4>
            <p className="leading-relaxed">
              All HCL and Terraform code produced by TerraGen belongs entirely to you and your organization, licensed under the terms of your choosing with zero vendor lock-in.
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
