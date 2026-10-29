import React, { useState } from 'react';
import {
  Server,
  Database,
  Terminal,
  ShieldCheck,
  Activity,
  Layers,
  Network,
  Cpu,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { AWS_SERVICE_NODES } from '../data/mockData';
import { AwsServiceNode } from '../types';

interface CloudVisualProps {
  onSelectServicePrompt?: (prompt: string) => void;
}

export const CloudVisual: React.FC<CloudVisualProps> = ({ onSelectServicePrompt }) => {
  const [activeNode, setActiveNode] = useState<AwsServiceNode | null>(null);

  // Helper to map icon name to Lucide Icon
  const renderIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Terminal':
        return <Terminal className={className} />;
      case 'Database':
        return <Database className={className} />;
      case 'Network':
        return <Network className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Server':
      default:
        return <Server className={className} />;
    }
  };

  // Central Core coordinates in viewBox (600 x 520)
  const coreX = 300;
  const coreY = 260;

  // Transform percentage coordinates to SVG absolute points
  const getNodeSvgCoord = (node: AwsServiceNode) => {
    return {
      x: (node.x / 100) * 600,
      y: (node.y / 100) * 520,
    };
  };

  const handleNodeClick = (node: AwsServiceNode) => {
    if (onSelectServicePrompt) {
      onSelectServicePrompt(node.samplePrompt);
    }
    const el = document.getElementById('cloudtalk');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-[620px] aspect-[600/520] select-none mx-auto">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.18)_0%,rgba(99,102,241,0.12)_45%,transparent_75%)] pointer-events-none" />

      {/* SVG Canvas for Connection Conduits and Data Pulses */}
      <svg
        viewBox="0 0 600 520"
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      >
        <defs>
          {/* Gradient for conduit lines */}
          <linearGradient id="conduit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="core-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Rings */}
        <circle
          cx={coreX}
          cy={coreY}
          r="140"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <circle
          cx={coreX}
          cy={coreY}
          r="210"
          fill="none"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1"
        />

        {/* Neural Conduits from Central Core to each AWS Service Node */}
        {AWS_SERVICE_NODES.map((node) => {
          const coord = getNodeSvgCoord(node);
          const isSelected = activeNode?.id === node.id;
          return (
            <g key={`conduit-${node.id}`}>
              {/* Underlying path line */}
              <line
                x1={coreX}
                y1={coreY}
                x2={coord.x}
                y2={coord.y}
                stroke={isSelected ? '#38BDF8' : 'rgba(56, 189, 248, 0.22)'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                strokeDasharray={isSelected ? 'none' : '4 4'}
                filter={isSelected ? 'url(#glow)' : undefined}
                className="transition-all duration-300"
              />
              {/* Flowing energy packet */}
              <circle r={isSelected ? '4' : '2.5'} fill="#38BDF8">
                <animateMotion
                  path={`M ${coreX} ${coreY} L ${coord.x} ${coord.y}`}
                  dur={`${2.2 + (node.x % 3)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Cross-service mesh links (e.g. Lambda to S3, VPC to EC2, CloudWatch to RDS) */}
        <line
          x1={(AWS_SERVICE_NODES[0].x / 100) * 600}
          y1={(AWS_SERVICE_NODES[0].y / 100) * 520}
          x2={(AWS_SERVICE_NODES[1].x / 100) * 600}
          y2={(AWS_SERVICE_NODES[1].y / 100) * 520}
          stroke="rgba(99, 102, 241, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <line
          x1={(AWS_SERVICE_NODES[2].x / 100) * 600}
          y1={(AWS_SERVICE_NODES[2].y / 100) * 520}
          x2={(AWS_SERVICE_NODES[6].x / 100) * 600}
          y2={(AWS_SERVICE_NODES[6].y / 100) * 520}
          stroke="rgba(6, 182, 212, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <line
          x1={(AWS_SERVICE_NODES[4].x / 100) * 600}
          y1={(AWS_SERVICE_NODES[4].y / 100) * 520}
          x2={(AWS_SERVICE_NODES[5].x / 100) * 600}
          y2={(AWS_SERVICE_NODES[5].y / 100) * 520}
          stroke="rgba(244, 114, 182, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      </svg>

      {/* Central CloudPilot AI Core */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center cursor-pointer group"
        onClick={() => {
          const el = document.getElementById('cloudtalk');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {/* Pulsing atmospheric ripples */}
        <div className="absolute w-28 h-28 rounded-full bg-cyan-500/15 animate-ping [animation-duration:3s]" />
        <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20" />
        
        {/* Core Node Glass Disk */}
        <div className="relative w-22 h-22 rounded-2xl bg-[#0D1527]/90 border border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.35)] backdrop-blur-md flex flex-col items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 shadow-md">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="mt-1 text-[11px] font-bold tracking-wider text-cyan-200 uppercase font-mono">
            Core AI
          </span>
        </div>

        {/* Ambient status below core */}
        <div className="mt-2 text-[10px] font-mono text-cyan-300/80 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
          Simulated Preview · 7 AWS Services
        </div>
      </div>

      {/* Floating AWS Service Nodes */}
      {AWS_SERVICE_NODES.map((node) => {
        const isHovered = activeNode?.id === node.id;
        // Position tooltip above if node is in the lower half of visual
        const isLowerHalf = node.y > 55;

        return (
          <div
            key={node.id}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              isHovered ? 'z-50 scale-105' : 'z-20 hover:scale-105'
            }`}
            onMouseEnter={() => setActiveNode(node)}
            onMouseLeave={() => setActiveNode(null)}
            onClick={() => handleNodeClick(node)}
          >
            {/* Interactive Service Card */}
            <button
              type="button"
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                isHovered
                  ? 'bg-[#141E38] border-cyan-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)] ring-1 ring-cyan-400'
                  : 'bg-[#0A1020]/90 border border-white/10 text-slate-300 hover:border-cyan-500/40 hover:bg-[#0F182E]'
              }`}
            >
              {/* Category-themed icon badge */}
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                  node.category === 'compute'
                    ? 'bg-amber-500/20 text-amber-400'
                    : node.category === 'storage'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : node.category === 'network'
                    ? 'bg-sky-500/20 text-sky-400'
                    : node.category === 'security'
                    ? 'bg-rose-500/20 text-rose-400'
                    : node.category === 'observability'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {renderIcon(node.icon, 'w-4 h-4')}
              </div>

              {/* Service label */}
              <div className="text-left">
                <span className="block text-xs font-semibold text-white whitespace-nowrap">
                  {node.name}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono capitalize">
                  {node.category}
                </span>
              </div>
            </button>

            {/* Hover Tooltip / Interactive Prompt Preview - strictly elevated with z-50 and solid glass background */}
            {isHovered && (
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-72 p-3.5 rounded-xl bg-[#0B1224] border border-cyan-400/80 shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
                  isLowerHalf ? 'bottom-full mb-3' : 'top-full mt-3'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono mb-1.5 font-semibold">
                  <span>{node.name} Capability</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-200 mb-2.5 leading-relaxed">
                  {node.description}
                </p>
                <div className="p-2 rounded-lg bg-black/70 border border-cyan-500/30 text-[11px] text-slate-200 font-mono">
                  <span className="text-cyan-400 font-semibold">ask: </span>
                  &ldquo;{node.samplePrompt}&rdquo;
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Decorative ambient floating markers */}
      <div className="absolute top-10 left-12 flex items-center gap-2 text-[11px] font-mono text-slate-400 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>Live Constellation Mesh</span>
      </div>
      <div className="absolute bottom-6 right-8 text-[11px] font-mono text-slate-500 pointer-events-none">
        Hover nodes to inspect prompt capabilities
      </div>
    </div>
  );
};
