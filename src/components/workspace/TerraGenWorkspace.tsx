import React, { useState, useEffect } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';
import { WorkspaceHeader } from './WorkspaceHeader';
import { ProjectSidebar } from './ProjectSidebar';
import { AiChatConsole } from './AiChatConsole';
import { CodeEditorPanel } from './CodeEditorPanel';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ResourceInspectorDrawer } from './ResourceInspectorDrawer';
import { ResourcesView } from './ResourcesView';
import { SecurityView } from './SecurityView';
import { ValidationView } from './ValidationView';
import { BottomConsolePanel } from './BottomConsolePanel';
import {
  INITIAL_PROJECTS,
  createSynchronizedStarterProject,
} from '../../data/initialProjects';
import {
  AwsResourceItem,
  HighlightedCodeBlock,
  ProjectData,
  WorkspaceViewMode,
  BottomPanelTab,
} from '../../types/workspace';
import {
  simulateTerraformFmt,
  simulateTerraformValidate,
  simulateSecurityScan,
  applyAiPromptToProject,
} from '../../utils/terraformEngine';
import { synchronizeProjectState } from '../../utils/terraformSync';
import confetti from 'canvas-confetti';

function getInitialViewMode(): WorkspaceViewMode {
  if (typeof window === 'undefined') return 'editor';
  const params = new URLSearchParams(window.location.search);
  const v = params.get('view');
  if (v === 'diagram' || v === 'resources' || v === 'security' || v === 'validation' || v === 'editor') {
    return v;
  }
  return 'editor';
}

export const TerraGenWorkspace: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>(getInitialViewMode);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Bottom panel state
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [bottomTab, setBottomTab] = useState<BottomPanelTab>('fmt');
  const [fmtOutput, setFmtOutput] = useState('');
  const [validateOutput, setValidateOutput] = useState('');
  const [securityOutput, setSecurityOutput] = useState('');

  // Selected resource for inspector drawer & highlighted HCL block
  const [inspectedResourceId, setInspectedResourceId] = useState<string | null>(null);
  const [highlightedBlock, setHighlightedBlock] = useState<HighlightedCodeBlock | null>(null);

  // Active project
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const inspectedResource = inspectedResourceId
    ? currentProject.resources.find((r) => r.id === inspectedResourceId) || null
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setInspectedResourceId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update current project helper
  const updateCurrentProject = (updater: (prev: ProjectData) => ProjectData) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === currentProjectId ? updater(proj) : proj))
    );
  };

  // Switch active project cleanly
  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setInspectedResourceId(null);
    setHighlightedBlock(null);
  };

  // React Flow node changes (preserves user-dragged coordinates)
  const onNodesChange: OnNodesChange = (changes) => {
    updateCurrentProject((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes),
    }));
  };

  // React Flow edge changes
  const onEdgesChange: OnEdgesChange = (changes) => {
    updateCurrentProject((prev) => ({
      ...prev,
      edges: applyEdgeChanges(changes, prev.edges),
    }));
  };

  // Reset layout positions back to canonical architectural tiers
  const handleResetLayout = () => {
    updateCurrentProject((prev) => synchronizeProjectState(prev, { resetLayout: true }));
  };

  // AI Prompt Send Handler (synchronizes files, diagram, resources, and security)
  const handleSendMessage = (prompt: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      updateCurrentProject((prev) => applyAiPromptToProject(prev, prompt));
      setIsGenerating(false);

      confetti({
        particleCount: 28,
        spread: 45,
        origin: { y: 0.9 },
        colors: ['#06B6D4', '#6366F1', '#A855F7'],
      });
    }, 450);
  };

  // Synchronized Code Editor Updates
  const handleUpdateFileContent = (fileName: string, content: string) => {
    updateCurrentProject((prev) =>
      synchronizeProjectState({
        ...prev,
        updatedAt: 'Just now',
        files: {
          ...prev.files,
          [fileName]: content,
        },
      })
    );
  };

  const handleSelectFile = (fileName: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      activeFileName: fileName,
    }));
  };

  const handleCreateFile = (fileName: string) => {
    updateCurrentProject((prev) =>
      synchronizeProjectState({
        ...prev,
        updatedAt: 'Just now',
        files: {
          ...prev.files,
          [fileName]: `# ${fileName} - Simulated HCL configuration\n`,
        },
        activeFileName: fileName,
      })
    );
  };

  const handleDeleteFile = (fileName: string) => {
    updateCurrentProject((prev) => {
      const newFiles = { ...prev.files };
      delete newFiles[fileName];
      const remainingNames = Object.keys(newFiles);
      return synchronizeProjectState({
        ...prev,
        updatedAt: 'Just now',
        files: newFiles,
        activeFileName: remainingNames[0] || 'main.tf',
      });
    });
  };

  // Open exact file and highlight/select resource block from Inspector or Inventory
  const handleOpenResourceInCode = (resource: AwsResourceItem) => {
    updateCurrentProject((prev) => ({
      ...prev,
      activeFileName: resource.file,
    }));
    setHighlightedBlock({
      fileName: resource.file,
      terraformAddress: resource.terraformAddress,
      startLine: resource.lineNumber,
      endLine: resource.endLine,
      timestamp: Date.now(),
    });
    setViewMode('editor');
  };

  // Project operations
  const handleCreateProject = (
    name: string,
    description: string,
    region: string,
    template: string
  ) => {
    const newProject = createSynchronizedStarterProject(name, description, region, template);
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setInspectedResourceId(null);
    setHighlightedBlock(null);
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  };

  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const dupId = `proj-copy-${Date.now()}`;
    const duplicate: ProjectData = {
      ...target,
      id: dupId,
      name: `${target.name} (Copy)`,
      updatedAt: 'Just now',
    };
    setProjects((prev) => [duplicate, ...prev]);
    setCurrentProjectId(dupId);
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (currentProjectId === id) {
      setCurrentProjectId(remaining[0].id);
      setInspectedResourceId(null);
      setHighlightedBlock(null);
    }
  };

  // Run format
  const handleRunFormat = () => {
    const activeFile = currentProject.activeFileName;
    const content = currentProject.files[activeFile] || '';
    const res = simulateTerraformFmt(content);
    if (res.changed) {
      handleUpdateFileContent(activeFile, res.formatted);
      setFmtOutput(
        `Formatted ${activeFile}\nReformatted to canonical 2-space HCL indentation.`
      );
    } else {
      setFmtOutput(`${activeFile} is already canonically formatted.`);
    }
    setBottomTab('fmt');
    setBottomCollapsed(false);
  };

  // Run validate
  const handleRunValidate = () => {
    const res = simulateTerraformValidate(currentProject.files);
    setValidateOutput(res.output);
    setBottomTab('validate');
    setBottomCollapsed(false);
  };

  // Run security scan
  const handleRunSecurity = () => {
    const res = simulateSecurityScan(currentProject.files);
    setSecurityOutput(
      `Simulated CIS Benchmark Posture Score: ${res.score}%\nPassed: ${res.passed} | Warnings: ${res.warnings} | Failures: ${res.failures}\nEvaluated against CIS AWS Foundations Benchmark v3.0.`
    );
    setBottomTab('security');
    setBottomCollapsed(false);
  };

  // Export full project
  const handleExportProject = () => {
    let combined = `# ===========================================\n# TerraGen AI Simulated Export - ${currentProject.name}\n# Region: ${currentProject.region}\n# ===========================================\n\n`;
    for (const [name, code] of Object.entries(currentProject.files)) {
      combined += `# --- File: ${name} ---\n${code}\n\n`;
    }
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}-terraform.tf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#06080F] text-slate-100 overflow-hidden font-sans">
      {/* Workspace Header */}
      <WorkspaceHeader
        currentProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRunFormat={handleRunFormat}
        onRunValidate={handleRunValidate}
        onExportProject={handleExportProject}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Project Sidebar */}
        <ProjectSidebar
          isOpen={sidebarOpen}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
        />

        {/* View Switcher Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {viewMode === 'editor' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Left Column: AI Chat Console (5 cols) */}
              <div className="lg:col-span-5 h-full overflow-hidden">
                <AiChatConsole
                  messages={currentProject.messages}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  onSelectFile={(f) => handleSelectFile(f)}
                />
              </div>

              {/* Right Column: Code Editor Panel (7 cols) */}
              <div className="lg:col-span-7 h-full overflow-hidden">
                <CodeEditorPanel
                  files={currentProject.files}
                  activeFileName={currentProject.activeFileName}
                  onSelectFile={handleSelectFile}
                  onUpdateFileContent={handleUpdateFileContent}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                  onFormatCode={handleRunFormat}
                  originalSnapshot={currentProject.originalFilesSnapshot}
                  highlightedBlock={highlightedBlock}
                  onClearHighlight={() => setHighlightedBlock(null)}
                  onSwitchToDiagram={() => setViewMode('diagram')}
                />
              </div>
            </div>
          )}

          {viewMode === 'diagram' && (
            <ArchitectureDiagram
              nodes={currentProject.nodes}
              edges={currentProject.edges}
              resources={currentProject.resources}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onSelectResource={(res) => setInspectedResourceId(res.id)}
              onResetLayout={handleResetLayout}
            />
          )}

          {viewMode === 'resources' && (
            <ResourcesView
              resources={currentProject.resources}
              onOpenInTerraformCode={handleOpenResourceInCode}
              onInspectResource={(res) => setInspectedResourceId(res.id)}
            />
          )}

          {viewMode === 'security' && (
            <SecurityView
              findings={currentProject.securityFindings}
              onRemediate={(prompt) => {
                setViewMode('editor');
                handleSendMessage(prompt);
              }}
            />
          )}

          {viewMode === 'validation' && (
            <ValidationView
              files={currentProject.files}
              onRunValidate={handleRunValidate}
            />
          )}

          {/* Collapsible Bottom Console Panel */}
          <BottomConsolePanel
            isCollapsed={bottomCollapsed}
            onToggleCollapse={() => setBottomCollapsed(!bottomCollapsed)}
            activeTab={bottomTab}
            onSelectTab={setBottomTab}
            fmtOutput={fmtOutput}
            validateOutput={validateOutput}
            securityOutput={securityOutput}
            onRunFormat={handleRunFormat}
            onRunValidate={handleRunValidate}
            onRunSecurity={handleRunSecurity}
          />
        </div>
      </div>

      {/* Slide-over AWS Resource Inspector Drawer */}
      <ResourceInspectorDrawer
        resource={inspectedResource}
        onClose={() => setInspectedResourceId(null)}
        onOpenInTerraformCode={handleOpenResourceInCode}
      />
    </div>
  );
};
