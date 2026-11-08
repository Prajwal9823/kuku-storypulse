'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Flame,
  Clock,
  Radar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scissors,
  Save,
  MessageSquare,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RankedPromo, HumanFeedback } from '@/lib/types';
import { sendFeedback } from '@/lib/api';

interface PromoStudioProps {
  promo: RankedPromo;
  onBack: () => void;
  onUpdatePromo: (updated: RankedPromo) => void;
}

export const PromoStudio: React.FC<PromoStudioProps> = ({
  promo,
  onBack,
  onUpdatePromo,
}) => {
  // Local state for editable timestamps
  const [startTime, setStartTime] = useState<number>(promo.segments[0].start_time);
  const [endTime, setEndTime] = useState<number>(promo.segments[promo.segments.length - 1].end_time);
  const [currentDuration, setCurrentDuration] = useState<number>(promo.total_duration);

  // Human feedback state
  const [feedbackStatus, setFeedbackStatus] = useState<string>(promo.human_feedback?.status || 'pending');
  const [weakHook, setWeakHook] = useState<boolean>(promo.human_feedback?.weak_hook_flag || false);
  const [weakCliff, setWeakCliff] = useState<boolean>(promo.human_feedback?.weak_cliffhanger_flag || false);
  const [notes, setNotes] = useState<string>(promo.human_feedback?.editorial_notes || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Live recalculate duration when timestamps change
  useEffect(() => {
    const dur = Math.max(0, endTime - startTime);
    setCurrentDuration(Number(dur.toFixed(2)));
  }, [startTime, endTime]);

  // Handle trim recommendation click
  const handleApplyTrim = (offset: number) => {
    const newStart = Number((startTime + offset).toFixed(2));
    setStartTime(newStart);
  };

  // Save feedback to backend
  const handleSaveFeedback = async () => {
    setIsSaving(true);
    try {
      await sendFeedback('i_married_a_broken_soldier__he_was_a_duke', promo.id, {
        status: feedbackStatus as any,
        weak_hook_flag: weakHook,
        weak_cliffhanger_flag: weakCliff,
        adjusted_start_time: startTime,
        adjusted_end_time: endTime,
        editorial_notes: notes,
      });

      // Update parent state
      const updatedPromo: RankedPromo = {
        ...promo,
        total_duration: currentDuration,
        human_feedback: {
          ...promo.human_feedback,
          status: feedbackStatus as any,
          weak_hook_flag: weakHook,
          weak_cliffhanger_flag: weakCliff,
          adjusted_start_time: startTime,
          adjusted_end_time: endTime,
          editorial_notes: notes,
        },
      };
      onUpdatePromo(updatedPromo);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to save editorial review to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  // Radar chart data preparation
  const radarData = [
    { subject: 'Opening Hook (22%)', score: promo.score_breakdown.hook_score, fullMark: 100 },
    { subject: 'Cliffhanger (22%)', score: promo.score_breakdown.cliffhanger_score, fullMark: 100 },
    { subject: 'Standalone (18%)', score: promo.score_breakdown.standalone_score, fullMark: 100 },
    { subject: 'Emotion (12%)', score: promo.score_breakdown.emotion_score, fullMark: 100 },
    { subject: 'Conflict (10%)', score: promo.score_breakdown.conflict_score, fullMark: 100 },
    { subject: 'Visuals (8%)', score: promo.score_breakdown.visual_score, fullMark: 100 },
    { subject: 'Novelty (8%)', score: promo.score_breakdown.novelty_score, fullMark: 100 },
  ];

  const isValidDuration = currentDuration >= 20.0 && currentDuration <= 60.0;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover Promos</span>
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-accent font-medium flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved locally to backend!
            </span>
          )}
          <button
            onClick={handleSaveFeedback}
            disabled={isSaving}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-violet-glow hover:bg-violet-accent text-white text-xs font-semibold shadow-md shadow-violet-glow/30 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Editorial Review'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface/80 border border-surface-border shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-violet-glow/20 text-violet-light border border-violet-glow/30">
                Rank #{promo.rank} Priority
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-medium bg-coral-accent/20 text-coral-light border border-coral-accent/30">
                {promo.emotional_category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Arc: {promo.primary_arc}
              </span>
              {promo.is_multi_segment && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Multi-Segment Assembly
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {promo.title}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              <span className="font-semibold text-violet-light">Why It Works: </span>
              {promo.one_line_why_it_works}
            </p>
          </div>

          {/* Big Score Box */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-surface-subtle border border-surface-border">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white font-mono">
                {promo.overall_score}
                <span className="text-sm text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-[10px] uppercase font-semibold text-violet-light mt-0.5">
                Promo DNA Score
              </div>
            </div>

            <div className="h-10 w-[1px] bg-surface-border" />

            <div className="text-center">
              <div className={`text-2xl font-bold font-mono ${isValidDuration ? 'text-white' : 'text-red-400'}`}>
                {currentDuration.toFixed(1)}s
              </div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
                {isValidDuration ? 'Valid Runtime' : 'Duration Violation'}
              </div>
            </div>
          </div>
        </div>

        {/* Segment Timeline & Timestamp Adjuster */}
        <div className="mt-6 pt-5 border-t border-surface-border/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-light" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Interactive Segment Timeline & Boundary Adjuster
              </span>
            </div>

            {!isValidDuration && (
              <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Must remain between 20.0s and 60.0s
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-subtle border border-surface-border">
            {/* Start timestamp */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Start Boundary (Seconds / Timestamp)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded bg-surface border border-surface-border text-white focus:outline-none focus:border-violet-glow"
                />
                <span className="text-xs font-mono text-slate-400">
                  {Math.floor(startTime / 60)}:{(startTime % 60).toFixed(2).padStart(5, '0')}
                </span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(startTime + 60, endTime)}
                  step="0.5"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="flex-1 accent-violet-glow cursor-pointer"
                />
              </div>
            </div>

            {/* End timestamp */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                End Boundary (Seconds / Timestamp)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded bg-surface border border-surface-border text-white focus:outline-none focus:border-violet-glow"
                />
                <span className="text-xs font-mono text-slate-400">
                  {Math.floor(endTime / 60)}:{(endTime % 60).toFixed(2).padStart(5, '0')}
                </span>
                <input
                  type="range"
                  min={startTime}
                  max={startTime + 80}
                  step="0.5"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="flex-1 accent-coral-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left (Deep Analyses & Radar) | Right (Screenplay Transcript) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): First 3s, Cliffhanger, Radar */}
        <div className="lg:col-span-7 space-y-6">
          {/* Panel 1: First 3 Seconds Analyzer */}
          <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-coral-light" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  The First-3-Seconds Analyzer
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coral-accent/20 text-coral-light border border-coral-accent/30 font-semibold">
                {promo.first_three_seconds.primary_hook_type}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                <span className="font-semibold text-white block mb-0.5">
                  Why It Stops The Scroll:
                </span>
                <p className="leading-relaxed">{promo.first_three_seconds.scroll_stopping_reason}</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                <span className="font-semibold text-white block mb-0.5">
                  Curiosity Gap Planted:
                </span>
                <p className="leading-relaxed">{promo.first_three_seconds.curiosity_gap}</p>
              </div>

              {promo.first_three_seconds.first_spoken_line && (
                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border font-mono text-[11px] text-violet-light">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold font-sans mb-1">
                    First Spoken Dialogue:
                  </span>
                  {promo.first_three_seconds.first_spoken_line}
                </div>
              )}

              {/* Timestamp Trim Recommendation */}
              <div className="p-3 rounded-lg bg-violet-glow/10 border border-violet-glow/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-semibold text-violet-light text-[11px] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    Trim Recommendation:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    {promo.first_three_seconds.trim_recommendation_reason}
                  </p>
                </div>

                {promo.first_three_seconds.recommended_trim_offset > 0 && (
                  <button
                    onClick={() => handleApplyTrim(promo.first_three_seconds.recommended_trim_offset)}
                    className="px-2.5 py-1 rounded bg-violet-glow hover:bg-violet-accent text-white text-[11px] font-semibold whitespace-nowrap transition-all"
                  >
                    Trim +{promo.first_three_seconds.recommended_trim_offset}s
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Panel 2: Cliffhanger Analysis */}
          <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-light" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cliffhanger & Next-Episode Drive
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-glow/20 text-violet-light border border-violet-glow/30 font-semibold">
                {promo.cliffhanger.cliffhanger_type}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                <span className="font-semibold text-white block mb-0.5">
                  Unresolved Tension at Final Cut:
                </span>
                <p className="leading-relaxed">{promo.cliffhanger.unresolved_tension}</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                <span className="font-semibold text-white block mb-0.5">
                  Why Viewer Taps Next Episode:
                </span>
                <p className="leading-relaxed">{promo.cliffhanger.next_action_urgency}</p>
              </div>

              {promo.cliffhanger.sound_cue_present && (
                <div className="p-2.5 rounded-lg bg-emerald-accent/10 border border-emerald-accent/30 text-[11px] text-emerald-accent flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cinematic audio cue verified (cliffhanger drone swell or freeze cut).</span>
                </div>
              )}
            </div>
          </div>

          {/* Panel 3: Promo DNA Radar Chart */}
          <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-violet-light" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Promo DNA 7-Dimension Radar
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Score: {promo.overall_score}/100
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#F9FAFB',
                    }}
                  />
                  <RechartsRadar
                    name="Promo Score"
                    dataKey="score"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Panel 4: Human-in-the-Loop Review Controls */}
          <div className="p-5 rounded-xl bg-surface/70 border border-surface-border space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-accent" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Human-in-the-Loop Review & Sign-Off
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-4">
                <label className="font-semibold text-slate-300">Approval Status:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFeedbackStatus('approved')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      feedbackStatus === 'approved'
                        ? 'bg-emerald-accent text-white shadow-md'
                        : 'bg-surface-subtle text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    onClick={() => setFeedbackStatus('rejected')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      feedbackStatus === 'rejected'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-surface-subtle text-slate-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => setFeedbackStatus('modified')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      feedbackStatus === 'modified'
                        ? 'bg-violet-glow text-white shadow-md'
                        : 'bg-surface-subtle text-slate-400 hover:text-white'
                    }`}
                  >
                    Modified
                  </button>
                </div>
              </div>

              {/* Diagnostic Checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={weakHook}
                    onChange={(e) => setWeakHook(e.target.checked)}
                    className="accent-violet-glow cursor-pointer"
                  />
                  <span>Flag Weak Hook</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={weakCliff}
                    onChange={(e) => setWeakCliff(e.target.checked)}
                    className="accent-violet-glow cursor-pointer"
                  />
                  <span>Flag Weak Cliffhanger</span>
                </label>
              </div>

              {/* Editorial Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Editorial Notes & Subtitle Instructions:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ensure caption cut aligns strictly with 00:23.70 freeze frame..."
                  className="w-full p-2.5 rounded-lg bg-surface-subtle border border-surface-border text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-glow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Screenplay Transcript */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-surface/70 border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-light" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Screenplay Source Transcript
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {promo.segments.reduce((acc, s) => acc + s.events_count, 0)} Events
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface/50 border border-surface-border max-h-[750px] overflow-y-auto space-y-3 font-mono text-xs">
            {promo.segments.map((seg, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div className="px-3 py-1.5 rounded bg-surface-subtle border border-surface-border text-[11px] text-slate-400 font-sans flex items-center justify-between">
                  <span className="font-bold text-violet-light">
                    Segment {sIdx + 1}: Episode {seg.episode_number}
                  </span>
                  <span>{seg.start_str} - {seg.end_str}</span>
                </div>

                {seg.events.map((ev, eIdx) => {
                  if (ev.event_type === 'dialogue') {
                    return (
                      <div
                        key={eIdx}
                        className="p-3 rounded-lg bg-surface/90 border border-surface-border/80 space-y-1 font-sans"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-coral-light">
                            {ev.speaker} {ev.delivery && <span className="font-normal italic text-slate-400">({ev.delivery})</span>}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{ev.start_str} - {ev.end_str}</span>
                        </div>
                        <p className="text-white text-xs leading-relaxed italic">
                          "{ev.content}"
                        </p>
                      </div>
                    );
                  } else if (ev.event_type === 'action') {
                    return (
                      <div
                        key={eIdx}
                        className="p-2.5 rounded bg-surface-subtle/60 border border-surface-border/40 text-[11px] text-slate-300 font-sans space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                          <span>ACTION</span>
                          <span className="font-mono">{ev.start_str} - {ev.end_str}</span>
                        </div>
                        <p className="leading-snug">{ev.content}</p>
                      </div>
                    );
                  } else if (ev.event_type === 'camera') {
                    return (
                      <div
                        key={eIdx}
                        className="p-2 rounded bg-surface-subtle/30 border border-surface-border/20 text-[10px] text-slate-400 font-sans flex items-center justify-between"
                      >
                        <span className="font-semibold text-violet-light/80">CAMERA: {ev.content}</span>
                        <span className="font-mono text-[9px] text-slate-500">{ev.start_str}</span>
                      </div>
                    );
                  } else if (ev.event_type === 'sound_fx') {
                    return (
                      <div
                        key={eIdx}
                        className="p-2 rounded bg-coral-accent/10 border border-coral-accent/30 text-[10px] text-coral-light font-sans flex items-center justify-between"
                      >
                        <span className="font-bold">SOUND FX: {ev.content}</span>
                        <span className="font-mono text-[9px]">{ev.start_str}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

