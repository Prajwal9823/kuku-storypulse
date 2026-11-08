'use client';

import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  GitGraph,
  Sliders,
  Scale,
  ShieldCheck,
  FileDown,
  Settings,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'discover'
  | 'story_intel'
  | 'editorial_studio'
  | 'compare'
  | 'quality'
  | 'exports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  promosCount: number;
  qcIssuesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  promosCount,
  qcIssuesCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'discover' as NavTab,
      label: 'Discover Promos',
      icon: Sparkles,
      badge: promosCount.toString(),
      badgeColor: 'bg-violet-glow text-white',
    },
    {
      id: 'story_intel' as NavTab,
      label: 'Story Intelligence',
      icon: GitGraph,
      badge: '6 Arcs',
      badgeColor: 'bg-surface-subtle text-slate-300',
    },
    {
      id: 'editorial_studio' as NavTab,
      label: 'Editorial Studio',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'compare' as NavTab,
      label: 'Compare Promos',
      icon: Scale,
      badge: null,
    },
    {
      id: 'quality' as NavTab,
      label: 'Quality Control',
      icon: ShieldCheck,
      badge: '10/10 Pass',
      badgeColor: 'bg-emerald-subtle text-emerald-accent border border-emerald-accent/30',
    },
    {
      id: 'exports' as NavTab,
      label: 'Exports & Reports',
      icon: FileDown,
      badge: 'PDF / CSV',
      badgeColor: 'bg-surface-subtle text-slate-400',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Config',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-surface-border bg-surface/50 backdrop-blur-sm flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-violet-glow/15 text-white border border-violet-glow/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-violet-light' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-surface-subtle text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Production Metadata Footer */}
      <div className="pt-4 border-t border-surface-border px-3 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span>Pipeline Engine</span>
          <span className="font-mono text-emerald-accent">v1.0.0 Live</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span>Diversity Reranker</span>
          <span className="font-mono text-violet-light">MMR λ=0.55</span>
        </div>
      </div>
    </aside>
  );
};

