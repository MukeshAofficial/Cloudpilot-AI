import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  Node,
  Edge,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Maximize2,
  RotateCcw,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  X,
  ArrowRight,
} from 'lucide-react';
import { AwsIconKey, AwsResourceItem } from '../../types/workspace';
import { AwsServiceIcon, AWS_ICON_META } from './AwsServiceIcon';

interface ArchitectureDiagramProps {
  nodes: Node[];
  edges: Edge[];
  resources: AwsResourceItem[];
  onNodesChange?: any;
  onEdgesChange?: any;
  onSelectResource: (resource: AwsResourceItem) => void;
  onResetLayout?: () => void;
}

interface DiagramContextValue {
  flowEnabled: boolean;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  onInspectResource: (res: AwsResourceItem) => void;
}

const DiagramInteractionContext = React.createContext<DiagramContextValue>({
  flowEnabled: true,
  hoveredNodeId: null,
  setHoveredNodeId: () => {},
  selectedEdgeId: null,
  setSelectedEdgeId: () => {},
  onInspectResource: () => {},
});

// 1. AWS Region Outer Container
const RegionGroupNode: React.FC<NodeProps> = ({ data }) => {
  const label = (data.label as string) || 'AWS Cloud · Region us-east-1';
  return (
    <div className="w-full h-full rounded-2xl border-2 border-dashed border-cyan-500/25 bg-[#070B16]/55 pointer-events-none relative">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/15 bg-[#091022]/80 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <AwsServiceIcon iconKey="region" size="xs" />
          <span className="text-xs font-mono font-semibold text-cyan-200 tracking-wide">
            {label}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] font-mono text-slate-400">
            Simulated HCL Topology (Offline)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Regional Managed Services Zone &rarr;
        </span>
      </div>
    </div>
  );
};

// 2. Amazon VPC Boundary Container
const VpcGroupNode: React.FC<NodeProps> = ({ data }) => {
  const ctx = React.useContext(DiagramInteractionContext);
  const label = (data.label as string) || 'VPC';
  const cidr = (data.cidr as string) || '10.0.0.0/16';
  const resource = data.resource as AwsResourceItem | undefined;

  return (
    <div className="w-full h-full rounded-2xl border-2 border-[#8C4FFF]/45 bg-[#0A0E22]/65 pointer-events-none relative shadow-[inset_0_0_40px_rgba(140,79,255,0.05)]">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#8C4FFF]/25 bg-[#111530]/85 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <AwsServiceIcon iconKey="vpc" size="xs" />
          <span className="text-xs font-semibold text-white">{label}</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] font-mono text-violet-300 tabular-nums">{cidr}</span>
        </div>

        {resource && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onInspectResource(resource);
            }}
            aria-label={`Inspect ${resource.terraformAddress}`}
            className="pointer-events-auto nodrag nopan inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-500/15 hover:bg-violet-500/30 border border-violet-400/30 text-[10px] font-mono text-violet-200 transition-colors cursor-pointer"
          >
            <span>Inspect VPC</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

// 3. Public / Private Subnet Boundary Container
const SubnetGroupNode: React.FC<NodeProps> = ({ data }) => {
  const ctx = React.useContext(DiagramInteractionContext);
  const tier = (data.tier as string) === 'public' ? 'public' : 'private';
  const isPublic = tier === 'public';
  const label = (data.label as string) || 'Subnet';
  const cidr = (data.cidr as string) || '10.0.1.0/24';
  const az = (data.az as string) || 'us-east-1a';
  const resource = data.resource as AwsResourceItem | undefined;

  return (
    <div
      className={`w-full h-full rounded-xl border border-dashed pointer-events-none relative ${
        isPublic
          ? 'border-[#7AA116]/55 bg-[#0C1917]/50'
          : 'border-[#00A4A6]/55 bg-[#081624]/60'
      }`}
    >
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b rounded-t-xl ${
          isPublic
            ? 'border-[#7AA116]/25 bg-[#10231B]/80'
            : 'border-[#00A4A6]/25 bg-[#0B1E2E]/85'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AwsServiceIcon
            iconKey={isPublic ? 'subnet-public' : 'subnet-private'}
            size="xs"
          />
          <span className="text-[11px] font-semibold text-slate-100 truncate">
            {label}
          </span>
          <span className="text-slate-600">·</span>
          <span
            className={`text-[11px] font-mono tabular-nums ${
              isPublic ? 'text-lime-300' : 'text-cyan-300'
            }`}
          >
            {cidr}
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            {az}
          </span>
        </div>

        {resource && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onInspectResource(resource);
            }}
            aria-label={`Inspect ${resource.terraformAddress}`}
            className={`pointer-events-auto nodrag nopan inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
              isPublic
                ? 'bg-lime-500/10 hover:bg-lime-500/25 border border-lime-400/30 text-lime-200'
                : 'bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200'
            }`}
          >
            <span>Inspect</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// 4. Draggable AWS Service Resource Node with Hover Tooltip
const AwsCustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const ctx = React.useContext(DiagramInteractionContext);
  const iconKey = (data.iconKey as AwsIconKey) || 'vpc';
  const label = (data.label as string) || 'resource';
  const terraformAddress = (data.terraformAddress as string) || label;
  const securitySummary = (data.securitySummary as string) || '';
  const details = (data.details as string) || '';
  const file = (data.file as string) || 'main.tf';
  const lineNumber = (data.lineNumber as number) || 1;
  const resource = data.resource as AwsResourceItem | undefined;
  const meta = AWS_ICON_META[iconKey] || AWS_ICON_META.vpc;

  const isHovered = ctx.hoveredNodeId === id;

  const handleClass =
    '!w-2 !h-2 !bg-cyan-400/80 !border !border-[#080D1A] transition-transform group-hover:scale-125';

  return (
    <div
      onMouseEnter={() => ctx.setHoveredNodeId(id)}
      onMouseLeave={() => ctx.setHoveredNodeId(null)}
      className={`group relative w-[204px] rounded-xl border p-3 backdrop-blur-md transition-all duration-150 cursor-grab active:cursor-grabbing ${
        selected
          ? 'bg-[#121C38] border-cyan-400 shadow-[0_0_28px_rgba(6,182,212,0.38)] ring-2 ring-cyan-400/80'
          : isHovered
          ? 'bg-[#101932] border-cyan-400/70 shadow-[0_0_24px_rgba(6,182,212,0.22)] -translate-y-0.5'
          : 'bg-[#0B1224]/95 border-white/15 shadow-xl'
      }`}
    >
      {/* Directional Connection Handles on all 4 sides */}
      <Handle id="top-target" type="target" position={Position.Top} className={handleClass} />
      <Handle id="top-source" type="source" position={Position.Top} className={handleClass} />
      <Handle id="right-target" type="target" position={Position.Right} className={handleClass} />
      <Handle id="right-source" type="source" position={Position.Right} className={handleClass} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className={handleClass} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className={handleClass} />
      <Handle id="left-target" type="target" position={Position.Left} className={handleClass} />
      <Handle id="left-source" type="source" position={Position.Left} className={handleClass} />

      <div className="flex items-start gap-2.5">
        <AwsServiceIcon iconKey={iconKey} size="md" />
        <div className="min-w-0 flex-1 text-left">
          <span className="text-[10px] font-mono text-cyan-300/90 block truncate">
            {meta.title}
          </span>
          <span className="text-xs font-bold text-white block truncate mt-0.5">
            {label}
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
        <span className="truncate">{securitySummary}</span>
        {resource && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onInspectResource(resource);
            }}
            aria-label={`Inspect ${terraformAddress}`}
            className="nodrag shrink-0 text-cyan-400 hover:text-cyan-200 inline-flex items-center gap-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1"
          >
            <span>Info</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Rich Hover Tooltip */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-64 rounded-xl bg-[#070B16]/98 border border-cyan-400/60 p-3 shadow-2xl pointer-events-none z-50 text-left"
        >
          <div className="text-[11px] font-mono font-semibold text-cyan-300 truncate">
            {terraformAddress}
          </div>
          <p className="mt-1 text-[11px] text-slate-200 leading-snug line-clamp-2">
            {details}
          </p>
          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>
              {file}:{lineNumber}
            </span>
            <span className="text-cyan-400">Click to inspect</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Custom Directional Labeled Edge with Connection Selection & Data-Flow Pulse
const AwsFlowEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
  animated,
}) => {
  const ctx = React.useContext(DiagramInteractionContext);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const color = (data?.color as string) || '#38BDF8';
  const label = (data?.label as string) || '';
  const dashed = Boolean(data?.dashed);

  const isSelected = Boolean(selected) || ctx.selectedEdgeId === id;
  const isConnectedToHovered =
    ctx.hoveredNodeId !== null && (ctx.hoveredNodeId === source || ctx.hoveredNodeId === target);
  const isHighlighted = isSelected || isConnectedToHovered;
  const isDimmed =
    ctx.hoveredNodeId !== null && !isConnectedToHovered && !isSelected;

  const showPulse = ctx.flowEnabled && (animated || isHighlighted);

  return (
    <>
      {/* Glow Halo when selected or connected to hovered node */}
      {isHighlighted && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeOpacity={0.28}
          className="pointer-events-none"
        />
      )}

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={22}
        style={{
          stroke: color,
          strokeWidth: isHighlighted ? 2.6 : 1.75,
          strokeDasharray: dashed ? '5 4' : undefined,
          opacity: isDimmed ? 0.3 : 0.92,
          transition: 'opacity 150ms ease, stroke-width 150ms ease',
        }}
      />

      {/* Animated Data-Flow Packet */}
      {showPulse && !isDimmed && (
        <circle r={isHighlighted ? 3.6 : 2.6} fill={color} className="pointer-events-none">
          <animateMotion dur={isHighlighted ? '1.6s' : '2.6s'} repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {label && (
        <EdgeLabelRenderer>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.setSelectedEdgeId(isSelected ? null : id);
            }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${
                labelY +
                (Math.abs(sourceY - targetY) < 28 &&
                Math.abs(targetX - sourceX) < 330 &&
                ((sourcePosition === Position.Right && targetPosition === Position.Left) ||
                  (sourcePosition === Position.Left && targetPosition === Position.Right))
                  ? -24
                  : 0)
              }px)`,
              pointerEvents: 'all',
            }}
            className={`nodrag nopan px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap shadow-md ${
              isSelected
                ? 'bg-[#101C38] border border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.4)] font-semibold z-30'
                : isConnectedToHovered
                ? 'bg-[#0D162C] border border-cyan-400/60 text-white z-20'
                : isDimmed
                ? 'bg-[#070B16]/75 border border-white/5 text-slate-500 opacity-50'
                : 'bg-[#080D1B]/95 border border-white/20 text-slate-200 hover:border-cyan-400/60 hover:text-white'
            }`}
          >
            {label}
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Inner Canvas Component with useReactFlow access
const DiagramCanvasInner: React.FC<ArchitectureDiagramProps> = ({
  nodes,
  edges,
  resources,
  onNodesChange,
  onEdgesChange,
  onSelectResource,
  onResetLayout,
}) => {
  const { fitView } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [flowEnabled, setFlowEnabled] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const nodeTypes = useMemo(
    () => ({
      regionGroup: RegionGroupNode,
      vpcGroup: VpcGroupNode,
      subnetGroup: SubnetGroupNode,
      awsNode: AwsCustomNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      awsFlowEdge: AwsFlowEdge,
    }),
    []
  );

  const handleFitScreen = useCallback(() => {
    fitView({ padding: 0.1, duration: 280 });
  }, [fitView]);

  // Responsive container resize fitView
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let frame: number;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        fitView({ padding: 0.08, duration: 0 });
      });
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fitView]);

  // Re-fit topology smoothly when switching projects or adding/removing resources via HCL/Chat
  const topologySignature = useMemo(
    () => `${nodes.map((n) => n.id).join('|')}::${edges.length}`,
    [nodes, edges.length]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.08, duration: 200 });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [topologySignature, fitView]);

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  const resolveNodeName = (nodeId: string) => {
    const found = nodes.find((n) => n.id === nodeId);
    return (found?.data?.terraformAddress as string) || (found?.data?.label as string) || nodeId;
  };

  const contextValue = useMemo<DiagramContextValue>(
    () => ({
      flowEnabled,
      hoveredNodeId,
      setHoveredNodeId,
      selectedEdgeId,
      setSelectedEdgeId,
      onInspectResource: onSelectResource,
    }),
    [flowEnabled, hoveredNodeId, selectedEdgeId, onSelectResource]
  );

  const resourceCount = resources.length;

  return (
    <DiagramInteractionContext.Provider value={contextValue}>
      <div
        ref={wrapperRef}
        data-testid="aws-topology-canvas"
        className="relative flex-1 w-full h-full bg-[#050811] overflow-hidden select-none"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, node) => {
            const res = node.data?.resource as AwsResourceItem | undefined;
            if (res) {
              onSelectResource(res);
            }
          }}
          onEdgeClick={(_, edge) => {
            setSelectedEdgeId((prev) => (prev === edge.id ? null : edge.id));
          }}
          onPaneClick={() => {
            setSelectedEdgeId(null);
          }}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.25}
          maxZoom={2.2}
          className="text-white [&_.react-flow__edgelabel-renderer]:!z-20 [&_.react-flow__node-regionGroup]:pointer-events-none [&_.react-flow__node-vpcGroup]:pointer-events-none [&_.react-flow__node-subnetGroup]:pointer-events-none [&_.react-flow__attribution]:!bg-transparent [&_.react-flow__attribution_a]:!text-slate-600"
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#1E293B" />
          <Controls
            showInteractive={false}
            className="!bg-[#0B1020] !border-white/15 !text-white !rounded-xl !shadow-xl [&>button]:!bg-[#0B1020] [&>button]:!border-white/10 [&>button]:!text-slate-300 [&>button:hover]:!text-cyan-300 [&>button:hover]:!bg-white/10"
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              if (n.type === 'regionGroup') return 'rgba(6, 182, 212, 0.12)';
              if (n.type === 'vpcGroup') return 'rgba(140, 79, 255, 0.22)';
              if (n.type === 'subnetGroup') {
                return n.data?.tier === 'public'
                  ? 'rgba(122, 161, 22, 0.28)'
                  : 'rgba(0, 164, 166, 0.28)';
              }
              return '#22D3EE';
            }}
            maskColor="rgba(5, 8, 17, 0.82)"
            className="!bg-[#080C18] !border-white/15 !rounded-xl !shadow-2xl overflow-hidden"
          />
        </ReactFlow>

        {/* Top-Left Simulated Architecture Bar */}
        <div className="absolute top-3.5 left-4 z-20 flex flex-wrap items-center gap-2 bg-[#090E1E]/92 border border-white/12 px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md text-xs font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white">Simulated AWS Topology</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-cyan-300 tabular-nums">{resourceCount} Resources</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-indigo-300 tabular-nums">{edges.length} Connections</span>
          <span aria-hidden="true" className="text-slate-600 hidden md:inline">
            ·
          </span>
          <span className="text-slate-400 hidden md:inline">No Live AWS Connection</span>
        </div>

        {/* Top-Right Interactive Canvas Controls */}
        <div className="absolute top-3.5 right-4 z-20 flex items-center gap-2 bg-[#090E1E]/92 border border-white/12 p-1.5 rounded-xl shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setFlowEnabled((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              flowEnabled
                ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-200'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Toggle Animated Data-Flow Pulses"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Data Flow: {flowEnabled ? 'On' : 'Paused'}</span>
          </button>

          {onResetLayout && (
            <button
              type="button"
              onClick={() => {
                onResetLayout();
                setTimeout(() => handleFitScreen(), 60);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              title="Snap Draggable Resources to Canonical Tier Layout"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Reset Layout</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFitScreen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            title="Fit Topology to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Fit to Screen</span>
          </button>
        </div>

        {/* Selected Connection Details Card (Bottom-Left above Controls) */}
        {selectedEdge && (
          <div className="absolute bottom-4 left-16 z-20 w-80 sm:w-96 rounded-xl bg-[#0A1022]/96 border border-cyan-400/50 p-3.5 shadow-2xl backdrop-blur-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-mono font-semibold text-cyan-300">
                Selected Connection · {(selectedEdge.data?.label as string) || 'Route'}
              </span>
              <button
                type="button"
                aria-label="Clear selected connection"
                onClick={() => setSelectedEdgeId(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-white">
              <span className="truncate">{resolveNodeName(selectedEdge.source)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{resolveNodeName(selectedEdge.target)}</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-300">
              <span className="text-slate-400 font-mono">Protocol: </span>
              {(selectedEdge.data?.protocol as string) || 'VPC / AWS API'}
            </div>
            <div className="mt-1 text-[11px] text-emerald-300/90 font-mono">
              {(selectedEdge.data?.securityNote as string) || 'Scoped policy enforced.'}
            </div>
          </div>
        )}
      </div>
    </DiagramInteractionContext.Provider>
  );
};

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
