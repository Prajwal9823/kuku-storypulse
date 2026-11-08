'use client';

import React from 'react';
import { Film, Upload, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  showTitle: string;
  totalEpisodes: number;
  totalRuntimeFormatted: string;
  onOpenUpload: () => void;
  onNavigateExports: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  showTitle,
  totalEpisodes,
  totalRuntimeFormatted,
  onOpenUpload,
  onNavigateExports,
}) => {
  return (
    <header className="h-16 border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-glow to-coral-accent flex items-center justify-center shadow-lg shadow-violet-glow/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white">
                KUKU <span className="text-violet-light font-extrabold">STORYPULSE</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-violet-glow/30 text-violet-light border border-violet-glow/40">
                Editorial AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Turn Every Story Into Its Next Viral Hook
            </p>
          </div>
        </div>

        {/* Show Info Badge */}
        <div className="hidden lg:flex items-center gap-2 ml-6 px-3 py-1.5 rounded-full bg-surface-subtle border border-surface-border text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
          <span className="font-medium text-slate-200 truncate max-w-[260px]">{showTitle}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">{totalEpisodes} Eps</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">{totalRuntimeFormatted}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-subtle hover:bg-surface-hover text-slate-200 border border-surface-border hover:border-violet-glow transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-violet-light" />
          <span className="hidden sm:inline">Upload Screenplay</span>
        </button>

        <button
          onClick={onNavigateExports}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-violet-accent to-violet-glow hover:opacity-90 text-white shadow-md shadow-violet-glow/25 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Slate</span>
        </button>
      </div>
    </header>
  );
};

