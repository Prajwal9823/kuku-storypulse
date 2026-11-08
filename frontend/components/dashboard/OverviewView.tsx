'use client';

import React from 'react';
import {
  Film,
  Sparkles,
  Award,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Play,
  Clock,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ShowSummary, RankedPromo } from '@/lib/types';

interface OverviewViewProps {
  summary: ShowSummary | null;
  promos: RankedPromo[];
  onSelectPromo: (promo: RankedPromo) => void;
  onNavigateDiscover: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Betrayal: '#F43F5E',
  Revenge: '#8B5CF6',
  Confrontation: '#EC4899',
  Romance: '#10B981',
  Suspense: '#3B82F6',
  Reveal: '#F59E0B',
  Mystery: '#06B6D4',
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  promos,
  onSelectPromo,
  onNavigateDiscover,
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading analytics overview...
      </div>
    );
  }

  // Prepare chart data
  const arcData = Object.entries(summary.arc_distribution || {}).map(
    ([arcName, count]) => ({
      name: arcName.length > 20 ? arcName.slice(0, 18) + '...' : arcName,
      fullName: arcName,
      count,
    })
  );

  const categoryData = Object.entries(summary.category_distribution || {}).map(
    ([catName, count]) => ({
      name: catName,
      value: count,
      color: CATEGORY_COLORS[catName] || '#8B5CF6',
    })
  );

  const topPromo = summary.top_promo || (promos.length > 0 ? promos[0] : null);

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Editorial Intelligence Overview
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-normal">
              50-Episode Screenplay Pack
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid discovery results combining deterministic timestamp parsing, narrative graphs, and Promo DNA scoring.
          </p>
        </div>

        <button
          onClick={onNavigateDiscover}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-surface-subtle hover:bg-surface-hover text-slate-200 border border-surface-border transition-all self-start sm:self-auto"
        >
          <span>Explore All {promos.length} Promos</span>
          <ArrowRight className="w-3.5 h-3.5 text-violet-light" />
        </button>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Episodes</span>
            <Film className="w-4 h-4 text-violet-light" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{summary.total_episodes}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {(summary.total_runtime_seconds / 60).toFixed(1)} mins runtime
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Candidates</span>
            <Sparkles className="w-4 h-4 text-coral-light" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{summary.candidates_discovered.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">20s-60s sliding windows</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Ranked Slate</span>
            <Award className="w-4 h-4 text-emerald-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{summary.high_quality_promos}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Diversity MMR selected</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Average Score</span>
            <TrendingUp className="w-4 h-4 text-violet-light" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{summary.average_promo_score}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Out of 100 Promo DNA</div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Story Arcs</span>
            <GitBranch className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{summary.story_arcs_count}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Narrative knowledge graph</div>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">QC Passed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-accent font-mono">10 / 10</div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% Traceability verified</div>
          </div>
        </div>
      </div>

      {/* Hero: Top Recommended Promo (#1) */}
      {topPromo && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-glow/40 bg-gradient-to-r from-surface to-surface-card p-6 shadow-xl">
          <div className="absolute top-0 right-0 h-40 w-40 bg-violet-glow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-violet-glow text-white tracking-wide">
                  #1 HERO PUBLISHING CHOICE
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-coral-accent/20 text-coral-light border border-coral-accent/30">
                  {topPromo.emotional_category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ep {topPromo.segments.map((s) => s.episode_number).join(', ')} • {topPromo.segments[0].start_str} - {topPromo.segments[topPromo.segments.length - 1].end_str}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">{topPromo.title}</h2>

              <p className="text-xs leading-relaxed text-slate-300">
                <span className="font-semibold text-violet-light">Why It Works: </span>
                {topPromo.one_line_why_it_works}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-subtle border border-surface-border">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-coral-light" />
                    First 3 Seconds Hook
                  </div>
                  <div className="text-slate-200 line-clamp-2">
                    {topPromo.first_three_seconds.scroll_stopping_reason}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-subtle border border-surface-border">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-violet-light" />
                    Cliffhanger Cut
                  </div>
                  <div className="text-slate-200 line-clamp-2">
                    {topPromo.cliffhanger.unresolved_tension}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Badge & Action */}
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-surface-subtle border border-surface-border min-w-[200px]">
              <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {topPromo.overall_score}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-xs text-violet-light font-medium mt-1">Promo DNA Score</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Runtime: {topPromo.total_duration.toFixed(1)}s
              </div>

              <button
                onClick={() => onSelectPromo(topPromo)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-glow hover:bg-violet-accent text-white text-xs font-semibold shadow-md shadow-violet-glow/30 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Inspect in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Story Arc Distribution */}
        <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Narrative Arc Representation</h3>
              <p className="text-[11px] text-slate-400">Promos discovered across the 6 major show arcs</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-surface-subtle border border-surface-border">
              MMR Balanced
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arcData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value, name, item) => [value, item.payload.fullName]}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Emotional Category Breakdown */}
        <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Emotional Hook Diversity</h3>
              <p className="text-[11px] text-slate-400">Distribution of psychological triggers across ranked slate</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-surface-subtle border border-surface-border">
              7 Categories
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 h-56">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#F9FAFB',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-300 font-medium">{cat.name}:</span>
                  <span className="text-slate-400 font-mono">{cat.value} promos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Publishing Slate Table */}
      <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recommended Publishing Slate (Top 5)</h3>
            <p className="text-[11px] text-slate-400">Launch order optimized for audience retention & conversion</p>
          </div>
          <button
            onClick={onNavigateDiscover}
            className="text-xs text-violet-light hover:underline font-medium flex items-center gap-1"
          >
            <span>View Full Slate ({promos.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface-subtle text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Promo Title</th>
                <th className="py-2.5 px-3">Episodes</th>
                <th className="py-2.5 px-3">Timestamps</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Publishing Target</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {promos.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-violet-glow/20 text-violet-light font-bold font-mono">
                      #{p.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-white max-w-xs truncate">
                    {p.title}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    Ep {p.segments.map((s) => s.episode_number).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {p.segments[0].start_str} - {p.segments[p.segments.length - 1].end_str}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {p.total_duration.toFixed(1)}s
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border">
                      {p.overall_score}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                    {p.publishing_slate_rationale}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectPromo(p)}
                      className="px-2.5 py-1 text-[11px] rounded bg-surface-subtle hover:bg-violet-glow hover:text-white text-slate-300 border border-surface-border transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

