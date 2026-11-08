'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Flame,
  Clock,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Scale,
} from 'lucide-react';
import { RankedPromo } from '@/lib/types';

interface PromoListProps {
  promos: RankedPromo[];
  onSelectPromo: (promo: RankedPromo) => void;
  selectedForCompare: string[];
  onToggleCompare: (promoId: string) => void;
}

export const PromoList: React.FC<PromoListProps> = ({
  promos,
  onSelectPromo,
  selectedForCompare,
  onToggleCompare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArc, setSelectedArc] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(75);
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'duration'>('rank');

  // Extract unique categories & arcs
  const categories = useMemo(() => {
    const set = new Set<string>();
    promos.forEach((p) => set.add(p.emotional_category));
    return Array.from(set);
  }, [promos]);

  const arcs = useMemo(() => {
    const set = new Set<string>();
    promos.forEach((p) => set.add(p.primary_arc));
    return Array.from(set);
  }, [promos]);

  // Filtered & sorted promos
  const filteredPromos = useMemo(() => {
    return promos
      .filter((p) => {
        if (minScore > 0 && p.overall_score < minScore) return false;
        if (selectedCategory !== 'all' && p.emotional_category !== selectedCategory) return false;
        if (selectedArc !== 'all' && p.primary_arc !== selectedArc) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchWhy = p.one_line_why_it_works.toLowerCase().includes(q);
          const matchHook = p.hook_explanation.toLowerCase().includes(q);
          const matchCliff = p.cliffhanger_explanation.toLowerCase().includes(q);
          const matchEp = p.segments.some((s) => s.episode_number.toString() === q);
          if (!matchTitle && !matchWhy && !matchHook && !matchCliff && !matchEp) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.overall_score - a.overall_score;
        if (sortBy === 'duration') return a.total_duration - b.total_duration;
        return a.rank - b.rank;
      });
  }, [promos, searchQuery, selectedCategory, selectedArc, minScore, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Discover Promos
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-mono">
              {filteredPromos.length} Candidates
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by Promo DNA (Hook 22%, Cliffhanger 22%, Standalone 18%, Emotion 12%, Conflict 10%, Visual 8%, Novelty 8%).
          </p>
        </div>

        {/* Comparison Counter */}
        {selectedForCompare.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-glow/20 border border-violet-glow/40 text-xs text-white">
            <Scale className="w-4 h-4 text-violet-light" />
            <span>
              {selectedForCompare.length} selected for comparison (max 3)
            </span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-surface/70 border border-surface-border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by keywords, episode, characters, dialogue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-surface-subtle border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-violet-glow"
            />
          </div>

          {/* Emotional Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-surface-border text-slate-200 focus:outline-none focus:border-violet-glow"
            >
              <option value="all">All Emotional Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-surface-border text-slate-200 focus:outline-none focus:border-violet-glow"
            >
              <option value="rank">Sort by Publishing Priority</option>
              <option value="score">Sort by Overall Score (High to Low)</option>
              <option value="duration">Sort by Duration (Shortest First)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters: Arc & Min Score */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-surface-border/50 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Arc:</span>
            <button
              onClick={() => setSelectedArc('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedArc === 'all'
                  ? 'bg-violet-glow text-white'
                  : 'bg-surface-subtle text-slate-400 hover:text-white'
              }`}
            >
              All Arcs
            </button>
            {arcs.map((arc) => (
              <button
                key={arc}
                onClick={() => setSelectedArc(arc)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium truncate max-w-[180px] transition-colors ${
                  selectedArc === arc
                    ? 'bg-violet-glow text-white'
                    : 'bg-surface-subtle text-slate-400 hover:text-white'
                }`}
              >
                {arc}
              </button>
            ))}
          </div>

          {/* Min Score Slider */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-[11px]">Min Score:</span>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 accent-violet-glow cursor-pointer"
            />
            <span className="font-mono text-white font-semibold text-[11px]">
              {minScore}
            </span>
          </div>
        </div>
      </div>

      {/* Promo Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPromos.map((p) => {
          const isComparing = selectedForCompare.includes(p.id);
          const feedbackStatus = p.human_feedback?.status || 'pending';

          return (
            <div
              key={p.id}
              className={`p-5 rounded-xl border transition-all duration-200 bg-surface/70 hover:bg-surface-hover/80 ${
                isComparing
                  ? 'border-violet-glow shadow-lg shadow-violet-glow/15'
                  : 'border-surface-border hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left side: Header, title, badges */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Rank pill */}
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-violet-glow/20 text-violet-light border border-violet-glow/30">
                      Rank #{p.rank}
                    </span>

                    {/* Category pill */}
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-coral-accent/20 text-coral-light border border-coral-accent/30">
                      {p.emotional_category}
                    </span>

                    {/* Episode & Timestamps */}
                    <span className="text-xs font-mono text-slate-300">
                      Ep {p.segments.map((s) => s.episode_number).join(', ')} • {p.segments[0].start_str} - {p.segments[p.segments.length - 1].end_str}
                    </span>

                    {/* Multi-segment badge */}
                    {p.is_multi_segment && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Multi-Cut
                      </span>
                    )}

                    {/* Review status badge */}
                    {feedbackStatus === 'approved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-accent/20 text-emerald-accent border border-emerald-accent/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {feedbackStatus === 'rejected' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Title & One-line reason */}
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-violet-light">Editorial Logic: </span>
                    {p.one_line_why_it_works}
                  </p>

                  {/* Hook and Cliffhanger mini-previews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded bg-surface-subtle border border-surface-border text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-coral-light flex items-center gap-1 mb-0.5">
                        <Flame className="w-3 h-3" /> Hook (0-3s):
                      </span>
                      <p className="line-clamp-1">{p.hook_explanation}</p>
                    </div>

                    <div className="p-2 rounded bg-surface-subtle border border-surface-border text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-violet-light flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3" /> Cliffhanger Cut:
                      </span>
                      <p className="line-clamp-1">{p.cliffhanger_explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Right side: Score & Action Buttons */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-border">
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-white font-mono">
                      {p.overall_score}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Runtime: {p.total_duration.toFixed(1)}s
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Compare Checkbox / Toggle */}
                    <button
                      onClick={() => onToggleCompare(p.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        isComparing
                          ? 'bg-violet-glow text-white border-violet-glow'
                          : 'bg-surface-subtle text-slate-400 hover:text-white border-surface-border'
                      }`}
                      title="Add to Editorial Comparison Studio"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Compare</span>
                    </button>

                    {/* Inspect button */}
                    <button
                      onClick={() => onSelectPromo(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-subtle hover:bg-violet-glow text-slate-200 hover:text-white border border-surface-border hover:border-violet-glow shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPromos.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-surface/50 rounded-xl border border-surface-border">
            No promos match the selected filter criteria. Try lowering the minimum score or clearing filters.
          </div>
        )}
      </div>
    </div>
  );
};

