import React from 'react';
import { MessageSquareText, Cpu, CheckCircle, ArrowRight, ShieldCheck, Database, GitBranch } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'State Your Intent',
      subtitle: 'Natural Language Prompting',
      description:
        'Describe what you need in conversational language—whether requesting a new multi-region database, diagnosing a latency anomaly, or searching for unattached storage.',
      badge: 'Zero CLI Memorization',
      icon: MessageSquareText,
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      step: '02',
      title: 'Deterministic AI Synthesis',
      subtitle: 'Resource Graph & Policy Engine',
      description:
        'CloudPilot constructs the underlying dependency graph, enforces strict encryption and least-privilege IAM constraints, and references live AWS cloud schemas.',
      badge: 'Automated Security Audit',
      icon: Cpu,
      accent: 'from-sky-500 to-indigo-500',
    },
    {
      step: '03',
      title: 'Verified Infrastructure',
      subtitle: 'Terraform HCL or Read-Only Insights',
      description:
        'Receive clean, version-controlled Terraform files ready for your git repository or instant diagnostic answers with concrete remediation commands.',
      badge: 'Production-Ready Output',
      icon: GitBranch,
      accent: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 border-t border-white/5 bg-[#070A13]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            Architecture Pipeline
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How CloudPilot Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            Translating human thoughts into verified cloud infrastructure through a deterministic three-stage pipeline.
          </p>
        </div>

        {/* 3 Step Pipeline Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-white/10 bg-[#0C1222]/80 backdrop-blur-xl p-8 flex flex-col justify-between glass-panel-hover"
              >
                <div>
                  {/* Top Step Number and Category */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-white/20">
                      {item.step}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.accent} p-0.5 mb-5 shadow-lg`}>
                    <div className="w-full h-full bg-[#0A0E1A] rounded-[10px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <div className="text-xs font-mono text-slate-400 mb-4">{item.subtitle}</div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom conduit indicator */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Pipeline Stage {idx + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
