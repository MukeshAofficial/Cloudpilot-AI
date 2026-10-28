import React from 'react';
import {
  MessageSquare,
  Activity,
  FileText,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Terminal,
  Zap,
} from 'lucide-react';

interface CloudTalkSectionProps {
  onOpenAccess: () => void;
}

export const CloudTalkSection: React.FC<CloudTalkSectionProps> = ({ onOpenAccess }) => {
  const capabilities = [
    {
      title: 'Natural-Language Inquiries',
      icon: MessageSquare,
      accent: 'text-cyan-400 bg-cyan-500/15',
      description:
        'Ask about unattached EBS volumes, cost spikes in us-east-1, open security groups, or deployment statuses without writing complex JMESPath filters or CLI scripts.',
      exampleQuery: '“Find all unattached gp3 volumes and compute monthly savings”',
    },
    {
      title: 'Cascade Error Investigation',
      icon: Activity,
      accent: 'text-indigo-400 bg-indigo-500/15',
      description:
        'When an incident fires, CloudPilot traces downstream dependencies across Lambda, DynamoDB, RDS, and API Gateway to identify the precise cascading failure.',
      exampleQuery: '“Why did order-processing Lambda error rate spike at 14:02 UTC?”',
    },
    {
      title: 'Multi-Source AWS Log Inspection',
      icon: FileText,
      accent: 'text-sky-400 bg-sky-500/15',
      description:
        'Synthesizes millions of VPC flow log records, container stdout streams, and CloudTrail event audits into plain-language timelines with verified root causes.',
      exampleQuery: '“Explain VPC flow log connection rejections on destination port 443”',
    },
  ];

  return (
    <section id="cloudtalk" className="relative py-24 border-t border-white/5 bg-[#080B14]">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            01. CloudTalk
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your AWS cloud. Just ask.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminate hours of clicking through disjointed AWS consoles and hunting through endless CloudWatch log groups. Ask what happened in plain English, and CloudPilot AI correlates metrics, traces, and IAM topologies to give you verified answers.
          </p>
        </div>

        {/* 3 Core Capability Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
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

                <div className="pt-4 border-t border-white/5">
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1">
                    Sample Inquiry
                  </div>
                  <div className="text-xs text-slate-400 font-mono italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                    {item.exampleQuery}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Bar with "Go to CloudTalk" button */}
        <div className="mt-12 rounded-2xl border border-cyan-500/30 bg-[#0C1222]/90 backdrop-blur-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Read-Only Safety by Default</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Connect CloudTalk to Your AWS Environment
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Zero agent installations or stored credentials. CloudTalk connects through an assumed IAM role with strict read-only permissions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenAccess}
              className="glow-button w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Go to CloudTalk</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#terragen"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              <span>Next: TerraGen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
