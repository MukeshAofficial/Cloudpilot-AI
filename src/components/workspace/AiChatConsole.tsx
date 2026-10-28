import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  FileCode2,
  Layers,
  ShieldCheck,
  CornerDownLeft,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { ChatMessage } from '../../types/workspace';

interface AiChatConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  isGenerating: boolean;
  onSelectFile?: (filename: string) => void;
}

export const AiChatConsole: React.FC<AiChatConsoleProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  onSelectFile,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Add a multi-AZ NAT gateway with private subnet routing',
    'Enable customer-managed KMS encryption on S3 buckets',
    'Attach Lambda to private subnet with least-privilege IAM',
    'Add centralized CloudWatch audit log group with 90-day retention',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080B15] border-r border-white/10 select-none">
      {/* Console Header */}
      <div className="p-3 border-b border-white/10 bg-[#060810] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
            TerraGen Assistant
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
          HCL &amp; Diagram Synced
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-100 rounded-tr-none'
                    : 'bg-[#0E1528] border border-white/10 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-mono text-slate-400">
                  <span className="font-semibold text-white">
                    {isUser ? 'You' : 'TerraGen AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* AI Change Details Card */}
                {!isUser && (msg.changedFiles || msg.addedResources) && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                    {msg.changedFiles && msg.changedFiles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-slate-400">Modified:</span>
                        {msg.changedFiles.map((file) => (
                          <button
                            key={file}
                            type="button"
                            onClick={() => onSelectFile && onSelectFile(file)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-cyan-300 hover:border-cyan-400 cursor-pointer"
                          >
                            <FileCode2 className="w-3 h-3 text-cyan-400" />
                            <span>{file}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.addedResources && msg.addedResources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-slate-400">Resources:</span>
                        {msg.addedResources.map((res) => (
                          <span
                            key={res}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300"
                          >
                            <Layers className="w-3 h-3 text-indigo-400" />
                            <span>{res}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.securityNote && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{msg.securityNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Progress State */}
        {isGenerating && (
          <div className="flex items-start gap-3 animate-in fade-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#0E1528] border border-cyan-500/30 p-3.5 rounded-2xl rounded-tl-none text-xs text-cyan-200 space-y-2">
              <div className="flex items-center gap-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>TerraGen AI is synthesizing cloud architecture...</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 space-y-1 pl-5">
                <div className="flex items-center gap-1 text-cyan-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Analyzing AWS dependency graph</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Formatting compliant Terraform HCL &amp; CIS rules</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip */}
      <div className="p-2 border-t border-white/5 bg-[#060810] overflow-x-auto flex items-center gap-1.5">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
        <span className="text-[10px] font-mono text-slate-400 shrink-0">Try:</span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSendMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-white/10 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-[#060912]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Describe an architecture change (e.g. 'Add a NAT Gateway with private subnet routing')..."
            className="w-full resize-none rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Press Cmd/Ctrl + Enter to send</span>
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="glow-button flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-md transition-opacity disabled:opacity-40 cursor-pointer"
            >
              <span>Apply Changes</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
