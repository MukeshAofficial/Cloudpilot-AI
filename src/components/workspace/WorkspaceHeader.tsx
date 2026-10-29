import React from 'react';
import {
  Code2,
  Network,
  Database,
  ShieldCheck,
  CheckCircle,
  FileDown,
  Sidebar,
  Play,
  RotateCcw,
} from 'lucide-react';
import { WorkspaceViewMode, ProjectData } from '../../types/workspace';
import { AwsServiceIcon } from './AwsServiceIcon';

interface WorkspaceHeaderProps {
  currentProject: ProjectData;
  projects: ProjectData[];
  onSelectProject: (projectId: string) => void;
  viewMode: WorkspaceViewMode;
  onChangeViewMode: (mode: WorkspaceViewMode) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRunFormat: () => void;
  onRunValidate: () => void;
  onExportProject: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  viewMode,
  onChangeViewMode,
  sidebarOpen,
  onToggleSidebar,
  onRunFormat,
  onRunValidate,
  onExportProject,
}) => {
  const navTabs: { id: WorkspaceViewMode; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'editor', label: 'Code & Chat', icon: Code2 },
    { id: 'diagram', label: 'Diagram', icon: Network },
    { id: 'resources', label: 'Resources', icon: Database, count: currentProject.resources.length },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
  ];

  return (
    <header className="h-16 shrink-0 border-b border-white/10 bg-[#070A14] px-4 lg:px-6 flex items-center justify-between gap-4 xl:gap-6 z-40 select-none">
      {/* Left Zone: Sidebar Toggle + Brand + Project Breadcrumb Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Toggle Project Sidebar"
          onClick={onToggleSidebar}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            sidebarOpen
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Project Sidebar (Ctrl+B)"
        >
          <Sidebar className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <AwsServiceIcon iconKey="vpc" size="sm" />
          <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap hidden sm:inline">
            TerraGen <span className="text-cyan-400">Workspace</span>
          </span>
        </div>

        <span aria-hidden="true" className="text-slate-600 hidden sm:inline shrink-0">
          /
        </span>

        <div className="flex items-center gap-2 min-w-0">
          <label htmlFor="workspace-project-select" className="sr-only">
            Active Terraform Project
          </label>
          <select
            id="workspace-project-select"
            aria-label="Active Terraform Project"
            value={currentProject.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="max-w-[150px] md:max-w-[175px] xl:max-w-[200px] 2xl:max-w-[260px] truncate rounded-lg bg-[#0C1222] border border-white/10 hover:border-cyan-500/40 px-2.5 py-1.5 text-xs font-mono font-medium text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-pointer transition-colors"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0B1020] text-slate-100">
                {p.name} ({p.region})
              </option>
            ))}
          </select>

          <span className="hidden 2xl:inline text-xs font-mono text-slate-400 whitespace-nowrap">
            · Simulated HCL Sandbox
          </span>
        </div>
      </div>

      {/* Center Zone: Segmented View Switcher */}
      <nav
        aria-label="Workspace Views"
        className="flex items-center gap-1 p-1 bg-[#0B1020] rounded-xl border border-white/10 text-xs font-medium shrink-0"
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeViewMode(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/50 text-cyan-200 font-semibold shadow-sm'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="hidden xl:inline font-mono text-[11px] tabular-nums text-slate-400">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Zone: Spaced Terraform Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onRunFormat}
          title="Format HCL (terraform fmt)"
          className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
          <span>Format</span>
        </button>

        <button
          type="button"
          onClick={onRunValidate}
          title="Validate Configuration (terraform validate)"
          className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 hover:border-emerald-500/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Play className="h-3.5 w-3.5 text-emerald-400" />
          <span>Validate</span>
        </button>

        <button
          type="button"
          onClick={onExportProject}
          title="Export Terraform Files (.tf)"
          className="glow-button inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span>Export HCL</span>
        </button>
      </div>
    </header>
  );
};
