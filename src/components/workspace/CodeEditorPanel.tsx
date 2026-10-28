import React, { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  FileCode2,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Split,
  FileCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CodeEditorPanelProps {
  files: Record<string, string>;
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
  onUpdateFileContent: (fileName: string, content: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileName: string) => void;
  onFormatCode: () => void;
  originalSnapshot?: Record<string, string>;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onUpdateFileContent,
  onCreateFile,
  onDeleteFile,
  onFormatCode,
  originalSnapshot,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const currentContent = files[activeFileName] || '';
  const originalContent = (originalSnapshot && originalSnapshot[activeFileName]) || currentContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    if (!name.endsWith('.tf')) name += '.tf';
    onCreateFile(name);
    setNewFileName('');
    setShowNewFileInput(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] select-none">
      {/* File Tab Bar & Action Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#070A14] px-2 h-10">
        
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 mr-2">
          {Object.keys(files).map((fileName) => {
            const isActive = fileName === activeFileName;
            return (
              <div
                key={fileName}
                onClick={() => onSelectFile(fileName)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0E1528] text-cyan-300 border-t border-x border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCode2 className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{fileName}</span>
                {Object.keys(files).length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${fileName}?`)) {
                        onDeleteFile(fileName);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded"
                    title={`Delete ${fileName}`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add File Trigger */}
          {showNewFileInput ? (
            <form onSubmit={handleCreateFileSubmit} className="flex items-center">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="name.tf"
                autoFocus
                onBlur={() => setShowNewFileInput(false)}
                className="bg-black/80 border border-cyan-400 text-xs font-mono text-white px-2 py-0.5 rounded w-28 focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewFileInput(true)}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Add New Terraform File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 text-xs">
          {/* Diff View Toggle */}
          <button
            type="button"
            onClick={() => setIsDiffMode(!isDiffMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              isDiffMode
                ? 'bg-indigo-600/30 border border-indigo-400 text-indigo-200'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Diff View (Compare with previous version)"
          >
            <Split className="w-3 h-3" />
            <span>Diff</span>
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-mono"
            title="Copy HCL Code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download File */}
          <button
            type="button"
            onClick={handleDownloadFile}
            className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
            title={`Download ${activeFileName}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#0A0D18]">
        {isDiffMode ? (
          <DiffEditor
            original={originalContent}
            modified={currentContent}
            language="hcl"
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <Editor
            value={currentContent}
            onChange={(val) => onUpdateFileContent(activeFileName, val || '')}
            language="hcl"
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="h-6 border-t border-white/5 bg-[#060810] px-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <span>{activeFileName}</span>
          <span>·</span>
          <span>HCL / Terraform 1.8+</span>
          <span>·</span>
          <span>{currentContent.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>·</span>
          <span>2 Spaces</span>
        </div>
      </div>
    </div>
  );
};
