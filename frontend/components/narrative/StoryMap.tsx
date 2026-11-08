'use client';

import React, { useState } from 'react';
import {
  GitGraph,
  Users,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Heart,
  Skull,
  Crown,
  Eye,
} from 'lucide-react';
import { NarrativeGraph, Character, StoryArc } from '@/lib/types';

interface StoryMapProps {
  graph: NarrativeGraph | null;
}

export const StoryMap: React.FC<StoryMapProps> = ({ graph }) => {
  const [selectedArcId, setSelectedArcId] = useState<string>('arc_1');

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading narrative intelligence graph...
      </div>
    );
  }

  const selectedArc = graph.arcs.find((a) => a.id === selectedArcId) || graph.arcs[0];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Story Intelligence & Narrative Graph
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-mono">
            {graph.characters.length} Characters • {graph.arcs.length} Arcs
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Story-level knowledge representation mapping Character → Event → Episode → Conflict → Consequence.
        </p>
      </div>

      {/* Narrative Arcs Progression Bar */}
      <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-light" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              50-Episode Arc Progression
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click an arc to inspect narrative connections</span>
        </div>

        {/* 6 Arc Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {graph.arcs.map((arc, idx) => {
            const isSelected = arc.id === selectedArcId;
            return (
              <button
                key={arc.id}
                onClick={() => setSelectedArcId(arc.id)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-violet-glow/20 border-violet-glow text-white shadow-md'
                    : 'bg-surface-subtle border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover'
                }`}
              >
                <div className="text-[10px] font-mono text-violet-light font-bold">
                  Arc {idx + 1} • Ep {arc.episode_start}-{arc.episode_end}
                </div>
                <div className="text-xs font-bold mt-1 line-clamp-1">{arc.title}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Arc Deep Dive Card */}
        {selectedArc && (
          <div className="p-4 rounded-xl bg-surface-subtle/80 border border-surface-border/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/50 pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-violet-light font-semibold">
                  Episodes {selectedArc.episode_start} to {selectedArc.episode_end}
                </span>
                <h3 className="text-base font-bold text-white">{selectedArc.title}</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-coral-accent/15 text-coral-light border border-coral-accent/30 self-start sm:self-auto font-medium">
                Tone: {selectedArc.emotional_tone}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedArc.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-2.5 rounded bg-surface border border-surface-border">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Core Conflict:
                </span>
                <p className="text-slate-200">{selectedArc.core_conflict}</p>
              </div>

              <div className="p-2.5 rounded bg-surface border border-surface-border">
                <span className="text-[10px] uppercase font-bold text-violet-light block mb-1">
                  Key Revelations:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {selectedArc.key_revelations.map((rev, rIdx) => (
                    <li key={rIdx}>{rev}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canonical Characters Roster */}
      <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-accent" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Canonical Character Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {graph.characters.map((char) => (
            <div
              key={char.id}
              className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border space-y-2 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{char.name}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-semibold bg-surface text-slate-400 border border-surface-border">
                  {char.role}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                {char.description}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {char.key_traits.map((trait, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[9px] px-1.5 py-0.2 rounded bg-violet-glow/15 text-violet-light border border-violet-glow/20"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-surface-border/40">
                <span>First Seen: Ep {char.first_episode}</span>
                <span>{char.total_lines} lines/beats</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative Chain Explorer: Character -> Event -> Episode -> Conflict -> Consequence */}
      <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitGraph className="w-4 h-4 text-coral-light" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Narrative Consequence Chains
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Character → Event → Conflict → Consequence
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            {
              char: 'Juliana',
              event: 'Altar Abandonment (Ep 1)',
              conflict: 'Gerald casts her aside for Clarissa',
              consequence: 'She indicts Gerald & accepts Alexander\'s proposal',
              color: 'border-coral-accent/30 bg-coral-accent/5',
            },
            {
              char: 'Clarissa',
              event: 'Blackthorn Briar Ordeal (Ep 13)',
              conflict: 'Sadistic ultimatum over signet ring',
              consequence: 'Juliana endures lacerations; Alexander vows protective vengeance',
              color: 'border-pink-500/30 bg-pink-500/5',
            },
            {
              char: 'Catherine',
              event: 'Arsenic in the Tea (Ep 25)',
              conflict: 'Covert slow poisoning of Dowager Duchess',
              consequence: 'Juliana hides antidote; Catherine frames her for witchcraft',
              color: 'border-blue-500/30 bg-blue-500/5',
            },
            {
              char: 'Alexander',
              event: 'Cathedral Gate Assault (Ep 42)',
              conflict: 'Rupert & Catherine attempting execution',
              consequence: 'Alexander shatters gates in ducal regalia; royal guards salute true Duke',
              color: 'border-violet-glow/30 bg-violet-glow/5',
            },
            {
              char: 'Catherine',
              event: 'Affair in Abandoned Wing (Ep 50)',
              conflict: 'Subversive conspiracy with Father Thomas',
              consequence: 'Witnessed by Agnes; creates final cliffhanger of series',
              color: 'border-amber-500/30 bg-amber-500/5',
            },
          ].map((chain, cIdx) => (
            <div
              key={cIdx}
              className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${chain.color}`}
            >
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="font-bold text-white">{chain.char}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>

              <div className="flex items-center gap-2 min-w-[200px]">
                <span className="text-slate-300 font-medium">{chain.event}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>

              <div className="flex items-center gap-2 min-w-[220px]">
                <span className="text-slate-400 italic">{chain.conflict}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>

              <div className="text-violet-light font-medium flex-1">
                {chain.consequence}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

