'use client';

import React from 'react';
import {
  Scale,
  Flame,
  Clock,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
} from 'lucide-react';
import { RankedPromo } from '@/lib/types';

interface ComparisonStudioProps {
  selectedPromos: RankedPromo[];
  onSelectPromo: (promo: RankedPromo) => void;
  onRemoveCompare: (promoId: string) => void;
  onClearAll: () => void;
}

export const ComparisonStudio: React.FC<ComparisonStudioProps> = ({
  selectedPromos,
  onSelectPromo,
  onRemoveCompare,
  onClearAll,
}) => {
  if (selectedPromos.length === 0) {
    return (
      <div className="p-12 text-center bg-surface/50 rounded-2xl border border-surface-border space-y-3">
        <Scale className="w-8 h-8 text-slate-500 mx-auto" />
        <h2 className="text-base font-bold text-white">No Promos Selected for Comparison</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Navigate to the <span className="text-violet-light font-semibold">Discover Promos</span> tab and click the "Compare" button on 2 or 3 candidates to inspect them side by side.
        </p>
      </div>
    );
  }

  // Derive automated comparative verdict
  const bestCandidate = [...selectedPromos].sort((a, b) => b.overall_score - a.overall_score)[0];
  const shortestCandidate = [...selectedPromos].sort((a, b) => a.total_duration - b.total_duration)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Editorial Comparison Studio
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-mono">
              {selectedPromos.length} Candidates Selected
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Head-to-head comparison of hook onset, unresolved cliffhanger metrics, and editorial publishing priority.
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="text-xs text-slate-400 hover:text-white underline transition-colors self-start sm:self-auto"
        >
          Clear Comparison
        </button>
      </div>

      {/* Automated Recommendation Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-violet-glow/15 to-surface border border-violet-glow/30 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-violet-light font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Automated Publishing Verdict</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          Based on 7-dimensional Promo DNA and scroll-retention modeling, <span className="font-bold text-white">{bestCandidate.title} (Rank #{bestCandidate.rank})</span> is recommended for immediate Day 1 deployment due to its superior {bestCandidate.score_breakdown.hook_score.toFixed(0)}/100 hook onset score. If targeting ultra-short attention spans, consider <span className="font-bold text-white">{shortestCandidate.title}</span> ({shortestCandidate.total_duration.toFixed(1)}s runtime).
        </p>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className={`grid grid-cols-1 md:grid-cols-${selectedPromos.length} gap-4`}>
        {selectedPromos.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-5 flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-violet-glow/20 text-violet-light border border-violet-glow/30">
                  Rank #{p.rank}
                </span>

                <button
                  onClick={() => onRemoveCompare(p.id)}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-coral-light">
                  {p.emotional_category}
                </span>
                <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                  {p.title}
                </h3>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Ep {p.segments.map((s) => s.episode_number).join(', ')} • {p.segments[0].start_str} - {p.segments[p.segments.length - 1].end_str}
                </div>
              </div>

              {/* Big Score & Duration */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-surface-subtle border border-surface-border text-center">
                <div>
                  <div className="text-2xl font-extrabold text-white font-mono">
                    {p.overall_score}
                  </div>
                  <div className="text-[10px] text-violet-light font-semibold uppercase">
                    Score / 100
                  </div>
                </div>

                <div className="border-l border-surface-border">
                  <div className="text-2xl font-bold text-white font-mono">
                    {p.total_duration.toFixed(1)}s
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Duration
                  </div>
                </div>
              </div>

              {/* 7 Breakdown Bars */}
              <div className="space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-400 text-[10px] uppercase pb-1 border-b border-surface-border/50">
                  Promo DNA Dimensions
                </div>

                {[
                  { label: 'Opening Hook (22%)', val: p.score_breakdown.hook_score, color: 'bg-coral-accent' },
                  { label: 'Cliffhanger (22%)', val: p.score_breakdown.cliffhanger_score, color: 'bg-violet-glow' },
                  { label: 'Standalone (18%)', val: p.score_breakdown.standalone_score, color: 'bg-blue-500' },
                  { label: 'Emotion (12%)', val: p.score_breakdown.emotion_score, color: 'bg-pink-500' },
                  { label: 'Conflict (10%)', val: p.score_breakdown.conflict_score, color: 'bg-amber-500' },
                  { label: 'Visuals (8%)', val: p.score_breakdown.visual_score, color: 'bg-emerald-accent' },
                  { label: 'Novelty (8%)', val: p.score_breakdown.novelty_score, color: 'bg-cyan-500' },
                ].map((row, rIdx) => (
                  <div key={rIdx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-mono font-bold text-white">{row.val.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-border overflow-hidden">
                      <div
                        className={`h-full ${row.color} rounded-full`}
                        style={{ width: `${row.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Hook & Cliffhanger details */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-2.5 rounded bg-surface-subtle border border-surface-border">
                  <span className="text-[10px] uppercase font-bold text-coral-light flex items-center gap-1 mb-0.5">
                    <Flame className="w-3 h-3" /> First 3s Hook:
                  </span>
                  <p className="text-slate-200 leading-snug line-clamp-3">
                    {p.first_three_seconds.scroll_stopping_reason}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-surface-subtle border border-surface-border">
                  <span className="text-[10px] uppercase font-bold text-violet-light flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Cliffhanger Cut:
                  </span>
                  <p className="text-slate-200 leading-snug line-clamp-3">
                    {p.cliffhanger.unresolved_tension}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-surface-subtle border border-surface-border">
                  <span className="text-[10px] uppercase font-bold text-emerald-accent block mb-0.5">
                    Audience Motivation:
                  </span>
                  <p className="text-slate-200 leading-snug">
                    {p.audience_motivation}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom button */}
            <button
              onClick={() => onSelectPromo(p)}
              className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-violet-glow text-slate-200 hover:text-white border border-surface-border hover:border-violet-glow text-xs font-semibold transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Open in Editorial Studio</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

