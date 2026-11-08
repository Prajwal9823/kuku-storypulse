'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { PromoList } from '@/components/promos/PromoList';
import { PromoStudio } from '@/components/promos/PromoStudio';
import { StoryMap } from '@/components/narrative/StoryMap';
import { ComparisonStudio } from '@/components/studio/ComparisonStudio';
import { QualityControlView } from '@/components/quality/QualityControlView';
import { ExportsView } from '@/components/exports/ExportsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { UploadModal } from '@/components/upload/UploadModal';

import {
  RankedPromo,
  ShowSummary,
  NarrativeGraph,
  QualityControlReport,
} from '@/lib/types';
import {
  fetchSummary,
  fetchPromos,
  fetchNarrativeMap,
  fetchQualityReport,
} from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [summary, setSummary] = useState<ShowSummary | null>(null);
  const [promos, setPromos] = useState<RankedPromo[]>([]);
  const [narrativeGraph, setNarrativeGraph] = useState<NarrativeGraph | null>(null);
  const [qcReport, setQcReport] = useState<QualityControlReport | null>(null);

  // Active Promo in Studio
  const [studioPromo, setStudioPromo] = useState<RankedPromo | null>(null);

  // Selected for Comparison (IDs)
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from backend
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, promosData, graphData, qcData] = await Promise.all([
        fetchSummary(),
        fetchPromos(),
        fetchNarrativeMap(),
        fetchQualityReport(),
      ]);

      setSummary(sumData);
      setPromos(promosData.promos);
      setNarrativeGraph(graphData);
      setQcReport(qcData);

      if (promosData.promos.length > 0 && !studioPromo) {
        setStudioPromo(promosData.promos[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleSelectPromo = (promo: RankedPromo) => {
    setStudioPromo(promo);
    setActiveTab('editorial_studio');
  };

  const handleUpdatePromo = (updated: RankedPromo) => {
    setStudioPromo(updated);
    setPromos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleToggleCompare = (promoId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(promoId)) {
        return prev.filter((id) => id !== promoId);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 promos simultaneously.');
        return prev;
      }
      return [...prev, promoId];
    });
  };

  const handleRemoveCompare = (promoId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== promoId));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  const comparedPromos = promos.filter((p) => compareIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <Navbar
        showTitle={summary?.show_title || 'I Married a Broken Soldier. He was a Duke'}
        totalEpisodes={summary?.total_episodes || 50}
        totalRuntimeFormatted={
          summary
            ? `${(summary.total_runtime_seconds / 60).toFixed(1)} mins`
            : '102.7 mins'
        }
        onOpenUpload={() => setIsUploadOpen(true)}
        onNavigateExports={() => setActiveTab('exports')}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          promosCount={promos.length}
          qcIssuesCount={qcReport?.failure_cases.length || 4}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isLoading && !summary ? (
            <div className="flex items-center justify-center h-96 text-slate-400">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-violet-glow border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono">Initializing KUKU STORYPULSE Engine...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  summary={summary}
                  promos={promos}
                  onSelectPromo={handleSelectPromo}
                  onNavigateDiscover={() => setActiveTab('discover')}
                />
              )}

              {activeTab === 'discover' && (
                <PromoList
                  promos={promos}
                  onSelectPromo={handleSelectPromo}
                  selectedForCompare={compareIds}
                  onToggleCompare={handleToggleCompare}
                />
              )}

              {activeTab === 'editorial_studio' && (
                <PromoStudio
                  promo={studioPromo || promos[0]}
                  onBack={() => setActiveTab('discover')}
                  onUpdatePromo={handleUpdatePromo}
                />
              )}

              {activeTab === 'story_intel' && (
                <StoryMap graph={narrativeGraph} />
              )}

              {activeTab === 'compare' && (
                <ComparisonStudio
                  selectedPromos={comparedPromos}
                  onSelectPromo={handleSelectPromo}
                  onRemoveCompare={handleRemoveCompare}
                  onClearAll={handleClearCompare}
                />
              )}

              {activeTab === 'quality' && (
                <QualityControlView report={qcReport} />
              )}

              {activeTab === 'exports' && <ExportsView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Screenplay Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          loadData();
          setActiveTab('overview');
        }}
      />
    </div>
  );
}

