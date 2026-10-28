import React, { useState } from 'react';
import { Cloud, Terminal, Shield, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenAccess: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAccess }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'CloudTalk', href: '#cloudtalk' },
    { label: 'TerraGen', href: '#terragen' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#06080F]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-8 px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0E1A]">
              <Cloud className="h-4.5 w-4.5 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
            </div>
            {/* Subtle beacon */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            CloudPilot <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">AI</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap transition-colors hover:text-cyan-400 hover:underline hover:underline-offset-8"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button
            onClick={onOpenAccess}
            className="glow-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:text-white md:hidden cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0A0E1A]/95 px-6 py-6 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-medium text-slate-200 hover:text-cyan-400"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccess();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
