import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Server,
  Database,
  Terminal,
  ShieldCheck,
  Activity,
  Layers,
  Network,
  Cloud,
  CheckCircle,
  ArrowUpRight,
  Lock,
  Globe,
} from 'lucide-react';

interface ArchitectureDiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: any;
  onEdgesChange?: any;
  onSelectNode: (node: Node) => void;
  onFitView?: () => void;
}

// Custom AWS Service Node Component
const AwsCustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const service = (data.service as string) || 'compute';
  const label = (data.label as string) || 'AWS Resource';
  const category = (data.category as string) || 'AWS Service';
  const status = (data.status as string) || 'valid';

  const renderIcon = () => {
    switch (service) {
      case 'compute':
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'storage':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'network':
        return <Network className="w-4 h-4 text-sky-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      case 'observability':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'database':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      default:
        return <Server className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`group relative min-w-[210px] rounded-xl border p-3 backdrop-blur-md transition-all cursor-pointer ${
        selected
          ? 'bg-[#121B35] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400'
          : 'bg-[#0A1020]/90 border-white/10 hover:border-cyan-500/50 hover:bg-[#0E1528] shadow-lg'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-cyan-400 border-2 border-[#0A1020]" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-cyan-400 border-2 border-[#0A1020]" />

      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 border border-white/10">
          {renderIcon()}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
              {category}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          </div>
          <span className="text-xs font-bold text-white block truncate mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {typeof data.details === 'string' && data.details.length > 0 && (
        <p className="mt-2 text-[10px] text-slate-400 line-clamp-1 border-t border-white/5 pt-1.5 font-mono">
          {data.details}
        </p>
      )}

      {/* Subtle hover prompt tip */}
      <div className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-cyan-400 font-mono flex items-center gap-0.5">
        <span>Inspect</span>
        <ArrowUpRight className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};

// Custom Region Node
const RegionCustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="min-w-[400px] border border-cyan-500/20 bg-cyan-950/[0.04] p-3 rounded-2xl pointer-events-none">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
        <Globe className="w-4 h-4 text-cyan-400" />
        <span>{data.label as string}</span>
      </div>
    </div>
  );
};

// Custom VPC Boundary Node
const VpcCustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="min-w-[460px] border border-sky-500/25 bg-sky-950/[0.06] p-3 rounded-2xl pointer-events-none">
      <div className="flex items-center justify-between text-xs font-mono text-sky-300 font-semibold">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <span>{data.label as string}</span>
        </div>
        <span className="text-[10px] bg-sky-950 border border-sky-500/30 px-2 py-0.5 rounded">
          {data.cidr as string}
        </span>
      </div>
    </div>
  );
};

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSelectNode,
}) => {
  const nodeTypes = useMemo(
    () => ({
      awsNode: AwsCustomNode,
      regionNode: RegionCustomNode,
      vpcNode: VpcCustomNode,
    }),
    []
  );

  return (
    <div className="relative w-full h-full bg-[#05070F] overflow-hidden select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectNode(node)}
        fitView
        className="text-white"
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
        <Controls className="!bg-[#0A0E1A] !border-white/10 !text-white !rounded-xl !shadow-xl [&>button]:!border-white/10 [&>button]:!text-slate-300 [&>button:hover]:!text-cyan-400 [&>button:hover]:!bg-white/5" />
        <MiniMap
          nodeColor="#06B6D4"
          maskColor="rgba(5, 7, 15, 0.85)"
          className="!bg-[#070A14] !border-white/10 !rounded-xl !shadow-2xl overflow-hidden"
        />
      </ReactFlow>

      {/* Floating Status Bar Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#090D1C]/90 border border-white/10 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md text-xs font-mono text-slate-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>AWS Topology Graph</span>
        <span className="text-slate-600">·</span>
        <span className="text-cyan-300">{nodes.length} Nodes</span>
        <span className="text-slate-600">·</span>
        <span className="text-indigo-300">{edges.length} Conduits</span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 text-[11px] font-mono text-slate-500 bg-black/60 px-3 py-1 rounded-lg pointer-events-none">
        Click any node to inspect configuration &amp; jump to code
      </div>
    </div>
  );
};
