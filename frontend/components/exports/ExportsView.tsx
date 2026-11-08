'use client';

import React from 'react';
import {
  FileDown,
  FileText,
  Table,
  Code,
  ShieldCheck,
  GitGraph,
  Download,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export const ExportsView: React.FC = () => {
  const exportItems = [
    {
      id: 'pdf',
      title: 'KUKU STORYPULSE Solution Document (PDF)',
      description: 'Concise 2-page executive PDF covering problem framing, architecture, algorithms, real 50-episode results, failure analysis, and scaling.',
      format: 'PDF (2 Pages)',
      icon: FileText,
      color: 'text-red-400 bg-red-500/10 border-red-500/30',
      endpoint: '/api/export/pdf',
      filename: 'KUKU_STORYPULSE_Solution_Document.pdf',
    },
    {
      id: 'csv',
      title: 'Ranked Promos Publishing Slate (CSV)',
      description: 'Tabular export of all ranked promos with timestamps, durations, scores, categories, hook & cliffhanger explanations, and publishing priorities.',
      format: 'CSV Spreadsheet',
      icon: Table,
      color: 'text-emerald-accent bg-emerald-accent/10 border-emerald-accent/30',
      endpoint: '/api/export/csv',
      filename: 'ranked_promos.csv',
    },
    {
      id: 'json',
      title: 'Final Ranked Promos Full Metadata (JSON)',
      description: 'Complete unedited JSON payload including 7-dimension Promo DNA radar scores, First-3-Seconds breakdown, cliffhanger analysis, and human feedback.',
      format: 'Structured JSON',
      icon: Code,
      color: 'text-violet-light bg-violet-glow/10 border-violet-glow/30',
      endpoint: '/api/export/json',
      filename: 'final_ranked_promos.json',
    },
    {
      id: 'markdown',
      title: 'Solution Document (Markdown Format)',
      description: 'Full uncompiled Markdown document formatted with GitHub-flavored markdown and analytical tables.',
      format: 'Markdown (.md)',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      endpoint: '/api/export/markdown',
      filename: 'KUKU_STORYPULSE_Solution_Document.md',
    },
    {
      id: 'qc',
      title: 'Quality Control & Failure Audit Report (JSON)',
      description: 'Audit report verifying 10 mathematical checks, 100% dialogue traceability, and the 4 documented algorithmic failure modes.',
      format: 'Audit JSON',
      icon: ShieldCheck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      endpoint: '/api/export/qc',
      filename: 'quality_control_report.json',
    },
    {
      id: 'narrative',
      title: 'Narrative Knowledge Graph (JSON)',
      description: 'Complete graph export mapping Characters, Relationships, 6 Story Arcs, and Character → Event → Conflict consequence chains.',
      format: 'Graph JSON',
      icon: GitGraph,
      color: 'text-coral-light bg-coral-accent/10 border-coral-accent/30',
      endpoint: '/api/export/narrative',
      filename: 'narrative_graph.json',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Exports & Raw Deliverables
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-mono font-semibold">
            Assignment Submission Pack
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Download unedited raw machine outputs, publishable CSV slates, narrative graphs, and the concise 2-page Solution Document.
        </p>
      </div>

      {/* Grid of Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-surface/70 border border-surface-border flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-subtle text-slate-400 border border-surface-border">
                    {item.format}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <a
                href={item.endpoint}
                download={item.filename}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-violet-glow text-slate-200 hover:text-white border border-surface-border hover:border-violet-glow text-xs font-semibold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {item.format}</span>
              </a>
            </div>
          );
        })}
      </div>

      {/* CLI Reproduction Instructions */}
      <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-violet-light" />
          <span>Reproducing Results From Scratch via CLI</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The entire Kuku StoryPulse pipeline can be executed in under 2 seconds on any new screenplay directory or ZIP file:
        </p>

        <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border font-mono text-xs text-emerald-accent">
          python backend/run_pipeline.py
        </div>
      </div>
    </div>
  );
};

