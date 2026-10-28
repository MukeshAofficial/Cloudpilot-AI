import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, Terminal, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { validateAccessRequest } from '../utils/cloudLogic';

interface InstantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstantAccessModal: React.FC<InstantAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'team' | 'enterprise'>('team');
  const [useCase, setUseCase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAccessRequest(email, environment);
    if (!validation.isValid) {
      setError(validation.error || 'Please fill out all required fields.');
      return;
    }

    setError(null);
    setIsSuccess(true);
    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#38BDF8', '#6366F1', '#A855F7'],
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('curl -sSL https://cloudpilot.ai/install.sh | bash');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setEmail('');
    setUseCase('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0C1222] p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={handleReset}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              Early Access Program
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Get Instant Access to CloudPilot AI
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Experience conversational AWS operations and automated Terraform synthesis. Zero credit card or stored credentials required.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Business or Personal Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  AWS Environment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sandbox', label: 'Sandbox' },
                    { id: 'team', label: 'Dev / Team' },
                    { id: 'enterprise', label: 'Enterprise' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setEnvironment(env.id as any)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                        environment === env.id
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Primary Cloud Use Case (Optional)
                </label>
                <input
                  type="text"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="e.g. Generate VPC Terraform &amp; inspect Lambda logs"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="glow-button w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg cursor-pointer"
                >
                  <span>Claim Early Access</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Read-only safety modes · Zero credential storage</span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              You are on the Priority List!
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              We have dispatched your developer onboarding pack to <span className="font-mono text-cyan-300">{email}</span>.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10 text-left">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Quick Evaluation Command</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded bg-[#070A13] font-mono text-xs text-slate-200 overflow-x-auto">
                curl -sSL https://cloudpilot.ai/install.sh | bash
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              Done &amp; Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
