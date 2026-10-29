import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  FileCode2,
  Database,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProjectData } from '../../types/workspace';

interface ProjectSidebarProps {
  isOpen: boolean;
  projects: ProjectData[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, description: string, region: string, template: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  isOpen,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectRegion, setNewProjectRegion] = useState('us-east-1');
  const [newProjectTemplate, setNewProjectTemplate] = useState('vpc-serverless');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingName.trim()) {
      onRenameProject(id, editingName.trim());
    }
    setEditingId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim(), newProjectDesc, newProjectRegion, newProjectTemplate);
    setNewProjectName('');
    setNewProjectDesc('');
    setShowCreateModal(false);
  };

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-[#060810] flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          <span>Projects ({projects.length})</span>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-sm"
          title="Create New Project"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {projects.map((project) => {
          const isActive = project.id === currentProjectId;
          const isRenaming = editingId === project.id;
          const fileCount = Object.keys(project.files).length;
          const resourceCount = project.resources.length;

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0E1529] border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {isRenaming ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="w-full text-xs font-semibold bg-black/60 border border-cyan-400 px-1.5 py-0.5 rounded text-white"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(project.id, e)}
                        className="text-emerald-400 hover:text-emerald-300 p-0.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate block">
                        {project.name}
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 font-mono mt-2">
                    <span className="inline-flex items-center gap-1 text-cyan-400/90 whitespace-nowrap shrink-0">
                      <Globe className="w-3 h-3 shrink-0" />
                      <span>{project.region}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                      <FileCode2 className="w-3 h-3 shrink-0" />
                      <span>{fileCount} files</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                      <Database className="w-3 h-3 shrink-0" />
                      <span>{resourceCount} res</span>
                    </span>
                  </div>
                </div>

                {/* Hover Actions */}
                {!isRenaming && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Rename Project"
                      onClick={(e) => handleStartRename(project, e)}
                      className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-white/10"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Duplicate Project"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(project.id);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-white/10"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        title="Delete Project"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Create TerraGen Project
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Staging VPC & Microservices"
                  required
                  autoFocus
                  className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="e.g. Multi-tier infrastructure with private subnets"
                  className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    AWS Region
                  </label>
                  <select
                    value={newProjectRegion}
                    onChange={(e) => setNewProjectRegion(e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-cyan-300 focus:outline-none font-mono"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                    <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Starter Template
                  </label>
                  <select
                    value={newProjectTemplate}
                    onChange={(e) => setNewProjectTemplate(e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-cyan-300 focus:outline-none font-mono"
                  >
                    <option value="vpc-serverless">VPC & Serverless API</option>
                    <option value="s3-kms">Hardened S3 & KMS</option>
                    <option value="blank">Blank Terraform Project</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-md cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
