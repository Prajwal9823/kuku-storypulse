'use client';

import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Cpu,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [weights, setWeights] = useState({
    hook: 22,
    cliffhanger: 22,
    standalone: 18,
    emotion: 12,
    conflict: 10,
    visual: 8,
    novelty: 8,
  });

  const [diversityLambda, setDiversityLambda] = useState(0.55);
  const [llmProvider, setLlmProvider] = useState('deterministic');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setWeights({
      hook: 22,
      cliffhanger: 22,
      standalone: 18,
      emotion: 12,
      conflict: 10,
      visual: 8,
      novelty: 8,
    });
    setDiversityLambda(0.55);
    setLlmProvider('deterministic');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Settings & Algorithm Configuration
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-mono">
            Pipeline Parameters
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust 7-dimensional Promo DNA component weights, diversity-relevance tradeoffs, and LLM inference providers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: 7-D Promo DNA Weights */}
        <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-violet-light" />
              <span>Promo DNA Component Weights</span>
            </div>
            <span
              className={`text-xs font-mono font-bold ${
                totalWeight === 100 ? 'text-emerald-accent' : 'text-amber-400'
              }`}
            >
              Sum: {totalWeight}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { key: 'hook', label: 'Opening Hook Strength (First 3s)' },
              { key: 'cliffhanger', label: 'Cliffhanger & Next-Episode Drive' },
              { key: 'standalone', label: 'Standalone Comprehensibility' },
              { key: 'emotion', label: 'Emotional Intensity' },
              { key: 'conflict', label: 'Conflict & Stakes' },
              { key: 'visual', label: 'Visual Storytelling Potential' },
              { key: 'novelty', label: 'Curiosity & Microdrama Novelty' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{label}</span>
                  <span className="font-mono font-bold text-white">
                    {(weights as any)[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={(weights as any)[key]}
                  onChange={(e) =>
                    setWeights({ ...weights, [key]: Number(e.target.value) })
                  }
                  className="w-full accent-violet-glow cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Diversity & LLM Adapter */}
        <div className="space-y-6">
          {/* Diversity MMR slider */}
          <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-coral-light" />
              <span>Maximal Marginal Relevance (MMR) Tradeoff</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Relevance vs. Diversity Balance (λ)</span>
                <span className="font-mono font-bold text-white">
                  {diversityLambda.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={diversityLambda}
                onChange={(e) => setDiversityLambda(Number(e.target.value))}
                className="w-full accent-coral-accent cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>More Diverse (λ=0.2)</span>
                <span>Balanced (λ=0.55)</span>
                <span>Pure Score (λ=0.9)</span>
              </div>
            </div>
          </div>

          {/* LLM Inference Adapter */}
          <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-emerald-accent" />
              <span>Pluggable LLM Inference Engine</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Active Provider:
                </label>
                <select
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-surface-border text-white focus:outline-none focus:border-violet-glow"
                >
                  <option value="deterministic">
                    Offline Deterministic Narrative Engine (100% Free / Default)
                  </option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="groq">Groq (Llama-3-70b High Speed)</option>
                  <option value="ollama">Local Ollama (http://localhost:11434/v1)</option>
                </select>
              </div>

              {llmProvider !== 'deterministic' && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    API Key (Optional / Configurable):
                  </label>
                  <input
                    type="password"
                    placeholder="Enter API Key or set LLM_API_KEY env var"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-violet-glow"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-accent font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Parameters applied!
              </span>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-surface-hover text-slate-300 border border-surface-border text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-glow hover:bg-violet-accent text-white text-xs font-semibold shadow-md shadow-violet-glow/25 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

