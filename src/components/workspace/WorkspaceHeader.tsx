import React from 'react';
import {
  Cloud,
  Code2,
  Network,
  Database,
  ShieldCheck,
  CheckCircle,
  FileDown,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Sidebar,
  Play,
  RotateCcw,
} from 'lucide-react';
import { WorkspaceViewMode, ProjectData } from '../../types/workspace';

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
  onBackToLanding: () => void;
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
  onBackToLanding,
}) => {
  return (
    <header className="h-14 border-b border-white/10 bg-[#070A14] px-4 flex items-center justify-between gap-4 z-40 select-none">
      {/* Left: Brand + Project Selector */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          aria-label="Toggle Project Sidebar"
          onClick={onToggleSidebar}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
            sidebarOpen
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
          }`}
          title="Toggle Project Sidebar (Ctrl+B)"
        >
          <Sidebar className="h-4 w-4" />
        </button>

        {/* Brand Icon */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#0A0E1A]">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
            TerraGen <span className="text-indigo-400">AI</span>
          </span>
        </div>

        <span className="text-slate-700 hidden sm:inline">/</span>

        {/* Project Dropdown */}
        <div className="relative flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Project:</span>
          <select
            value={currentProject.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer pr-4"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0B1020] text-slate-200">
                {p.name} ({p.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: View Mode Tabs */}
      <nav className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs font-medium">
        {[
          { id: 'editor', label: 'Code & Chat', icon: Code2 },
          { id: 'diagram', label: 'Diagram', icon: Network },
          { id: 'resources', label: 'Resources', icon: Database },
          { id: 'security', label: 'Security', icon: ShieldCheck },
          { id: 'validation', label: 'Validation', icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeViewMode(tab.id as WorkspaceViewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/50 text-cyan-200 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Format */}
        <button
          type="button"
          onClick={onRunFormat}
          title="Format HCL (terraform fmt)"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
          <span>Format</span>
        </button>

        {/* Quick Validate */}
        <button
          type="button"
          onClick={onRunValidate}
          title="Validate Configuration (terraform validate)"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Play className="h-3.5 w-3.5 text-emerald-400" />
          <span>Validate</span>
        </button>

        {/* Export / Download Project */}
        <button
          type="button"
          onClick={onExportProject}
          title="Export Terraform Files (.tf)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export HCL</span>
        </button>

        {/* Back to Landing Page */}
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Return to CloudPilot AI Landing Page"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Landing</span>
        </button>
      </div>
    </header>
  );
};
