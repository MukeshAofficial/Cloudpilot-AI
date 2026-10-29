import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import * as monacoInstance from 'monaco-editor';
import editorWorker from 'monaco-editor/editor/editor.worker?worker';
import {
  FileCode2,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Split,
  Network,
  X,
} from 'lucide-react';
import { HighlightedCodeBlock } from '../../types/workspace';
import { findTerraformBlockRange } from '../../utils/terraformSync';

if (typeof window !== 'undefined') {
  (window as any).MonacoEnvironment = {
    getWorker() {
      return new editorWorker();
    },
  };
  loader.config({ monaco: monacoInstance });
}

interface CodeEditorPanelProps {
  files: Record<string, string>;
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
  onUpdateFileContent: (fileName: string, content: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileName: string) => void;
  onFormatCode: () => void;
  originalSnapshot?: Record<string, string>;
  highlightedBlock?: HighlightedCodeBlock | null;
  onClearHighlight?: () => void;
  onSwitchToDiagram?: () => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onUpdateFileContent,
  onCreateFile,
  onDeleteFile,
  originalSnapshot,
  highlightedBlock,
  onClearHighlight,
  onSwitchToDiagram,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const currentContent = files[activeFileName] || '';
  const originalContent =
    (originalSnapshot && originalSnapshot[activeFileName]) || currentContent;

  const activeBlockRange =
    highlightedBlock && highlightedBlock.fileName === activeFileName
      ? findTerraformBlockRange(currentContent, highlightedBlock.terraformAddress) || {
          startLine: highlightedBlock.startLine,
          endLine: highlightedBlock.endLine,
        }
      : null;

  const applyBlockSelectionInEditor = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (!highlightedBlock || highlightedBlock.fileName !== activeFileName) {
      decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
      return;
    }

    const resolved =
      findTerraformBlockRange(currentContent, highlightedBlock.terraformAddress) || {
        startLine: highlightedBlock.startLine,
        endLine: highlightedBlock.endLine,
      };

    const lines = currentContent.split('\n');
    const safeStart = Math.max(1, Math.min(resolved.startLine, lines.length));
    const safeEnd = Math.max(safeStart, Math.min(resolved.endLine, lines.length));
    const endColumn = (lines[safeEnd - 1]?.length || 0) + 1;

    editor.revealLineInCenter(safeStart);
    editor.setSelection({
      startLineNumber: safeStart,
      startColumn: 1,
      endLineNumber: safeEnd,
      endColumn,
    });

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, [
      {
        range: new monaco.Range(safeStart, 1, safeEnd, 1),
        options: {
          isWholeLine: true,
          className: 'terragen-highlighted-block',
        },
      },
    ]);
  }, [highlightedBlock, activeFileName, currentContent]);

  useEffect(() => {
    applyBlockSelectionInEditor();
  }, [applyBlockSelectionInEditor]);

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
      <div className="flex items-center justify-between border-b border-white/10 bg-[#070A14] px-2.5 h-10 shrink-0">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Terraform Files"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 mr-2"
        >
          {Object.keys(files).map((fileName) => {
            const isActive = fileName === activeFileName;
            return (
              <div
                key={fileName}
                className={`group flex items-center rounded-t-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-[#0E1528] text-cyan-300 border-t border-x border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectFile(fileName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <FileCode2
                    className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                  />
                  <span>{fileName}</span>
                </button>
                {Object.keys(files).length > 1 && (
                  <button
                    type="button"
                    aria-label={`Delete ${fileName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(fileName);
                    }}
                    className="opacity-0 group-hover:opacity-100 pr-2 py-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
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
                aria-label="New Terraform filename"
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
              aria-label="Add New Terraform File"
              onClick={() => setShowNewFileInput(true)}
              className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Add New Terraform File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 text-xs shrink-0">
          {onSwitchToDiagram && (
            <button
              type="button"
              onClick={onSwitchToDiagram}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer whitespace-nowrap"
              title="View Synchronized Topology Diagram"
            >
              <Network className="w-3 h-3" />
              <span>Topology</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDiffMode(!isDiffMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              isDiffMode
                ? 'bg-indigo-600/30 border border-indigo-400 text-indigo-200'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Diff View (Compare with previous version)"
          >
            <Split className="w-3 h-3" />
            <span>Diff</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-mono whitespace-nowrap"
            title="Copy HCL Code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            aria-label={`Download ${activeFileName}`}
            onClick={handleDownloadFile}
            className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
            title={`Download ${activeFileName}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Resource Block Banner (when navigated from Diagram / Inspector / Inventory) */}
      {highlightedBlock && activeBlockRange && (
        <div
          data-testid="selected-hcl-block-banner"
          className="px-3.5 py-2 border-b border-cyan-500/30 bg-cyan-950/35 flex items-center justify-between gap-3 text-xs font-mono shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400">Selected Block:</span>
            <span className="font-semibold text-cyan-200 truncate">
              {highlightedBlock.terraformAddress}
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="text-slate-300 tabular-nums shrink-0">
              Lines {activeBlockRange.startLine}&ndash;{activeBlockRange.endLine}
            </span>
          </div>
          {onClearHighlight && (
            <button
              type="button"
              aria-label="Clear block selection"
              onClick={onClearHighlight}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

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
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
              applyBlockSelectionInEditor();
            }}
            loading={
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-auto h-full w-full">
                {currentContent}
              </pre>
            }
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
      <div className="h-6 border-t border-white/5 bg-[#060810] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2.5">
          <span>{activeFileName}</span>
          <span aria-hidden="true">·</span>
          <span>Terraform 1.8+ HCL (Simulated)</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{currentContent.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Live Topology Sync</span>
          <span aria-hidden="true">·</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
