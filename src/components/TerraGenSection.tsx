import React from 'react';
import {
  Code,
  ShieldCheck,
  Lock,
  Layers,
  ArrowRight,
  Check,
  Key,
  ShieldAlert,
  Server,
  FileCode,
} from 'lucide-react';

interface TerraGenSectionProps {
  onOpenAccess: () => void;
}

export const TerraGenSection: React.FC<TerraGenSectionProps> = ({ onOpenAccess }) => {
  const securityPillars = [
    {
      title: 'Security-Conscious Networking',
      icon: Layers,
      accent: 'text-cyan-400 bg-cyan-500/15',
      description:
        'Every VPC automatically provisions private subnets, disabled public IPs by default, redundant NAT gateways, and isolated route tables with zero open 0.0.0.0/0 ingress.',
      standards: ['Multi-AZ Private Subnets', 'NAT Gateway Isolation', 'VPC Flow Logs Enabled'],
    },
    {
      title: 'Comprehensive Encryption Defaults',
      icon: Lock,
      accent: 'text-purple-400 bg-purple-500/15',
      description:
        'Customer-managed KMS keys with automated 365-day rotation, S3 bucket keying, EBS volume encryption, and enforced TLS 1.3 HTTPS transport policies.',
      standards: ['AWS KMS CMK Rotation', 'Bucket Key Optimization', 'TLS 1.3 HTTPS Enforcement'],
    },
    {
      title: 'Zero-Wildcard Access Control',
      icon: ShieldCheck,
      accent: 'text-indigo-400 bg-indigo-500/15',
      description:
        'Tightly scoped IAM execution roles with granular resource ARNs. TerraGen strictly forbids unrestricted wildcard statements in all generated Terraform HCL.',
      standards: ['Least-Privilege Role Policies', 'Granular Resource ARNs', 'CIS AWS Foundations 3.0'],
    },
  ];

  return (
    <section id="terragen" className="relative py-24 border-t border-white/5 bg-[#060911]">
      {/* Ambient background light */}
      <div className="absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold tracking-wider text-indigo-400 uppercase">
            02. TerraGen
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            From plain English to Terraform.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Stop stitching together outdated StackOverflow snippets and manual provider docs. Describe the architecture you need, and TerraGen produces modular, audited HashiCorp HCL with enterprise-grade networking, encryption, and access controls built in by default.
          </p>
        </div>

        {/* 3 Core Security Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-7 rounded-2xl border border-white/10 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent} mb-5 shadow-md`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  {item.standards.map((std, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{std}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Bar with "Go to TerraGen" button */}
        <div className="mt-12 rounded-2xl border border-indigo-500/30 bg-[#0A0F1D]/90 backdrop-blur-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-semibold uppercase tracking-wider mb-1">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Modular &amp; Version-Controlled HCL</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Generate Production Terraform from Plain English
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Compatible with Terraform 1.8+ and OpenTofu. Outputs clean, formatted .tf files complete with variables, outputs, and security tags.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenAccess}
              className="glow-button w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Go to TerraGen</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#how-it-works"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              <span>How It Works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
