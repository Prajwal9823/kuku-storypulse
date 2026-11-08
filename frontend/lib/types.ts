export interface ScreenplayEvent {
  id: string;
  episode_number: number;
  scene_number: number;
  event_type: 'dialogue' | 'action' | 'camera' | 'sound_fx';
  start_time: number;
  end_time: number;
  start_str: string;
  end_str: string;
  speaker?: string | null;
  delivery?: string | null;
  content: string;
  raw_header: string;
}

export interface PromoSegment {
  segment_index: number;
  episode_number: number;
  episode_logline?: string | null;
  start_time: number;
  end_time: number;
  start_str: string;
  end_str: string;
  duration: number;
  events_count: number;
  transcript_summary: string;
  events: ScreenplayEvent[];
}

export interface ScoreBreakdown {
  hook_score: number;
  cliffhanger_score: number;
  standalone_score: number;
  emotion_score: number;
  conflict_score: number;
  visual_score: number;
  novelty_score: number;
  penalties: Record<string, number>;
  penalty_total: number;
  total_score: number;
}

export interface FirstThreeSecondsAnalysis {
  duration_analyzed: number;
  first_events: ScreenplayEvent[];
  primary_hook_type: string;
  scroll_stopping_reason: string;
  curiosity_gap: string;
  recommended_trim_offset: number;
  trim_recommendation_reason: string;
  starts_with_dialogue: boolean;
  first_spoken_line?: string | null;
}

export interface CliffhangerAnalysis {
  duration_analyzed: number;
  final_events: ScreenplayEvent[];
  cliffhanger_type: string;
  unresolved_tension: string;
  sound_cue_present: boolean;
  last_spoken_line?: string | null;
  next_action_urgency: string;
}

export interface HumanFeedback {
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  weak_hook_flag: boolean;
  weak_cliffhanger_flag: boolean;
  adjusted_start_time?: number | null;
  adjusted_end_time?: number | null;
  editorial_notes: string;
  reviewed_by?: string | null;
  timestamp?: string | null;
}

export interface RankedPromo {
  id: string;
  rank: number;
  publishing_priority: number;
  title: string;
  primary_arc: string;
  emotional_category: string;
  is_multi_segment: boolean;
  segments: PromoSegment[];
  total_duration: number;
  score_breakdown: ScoreBreakdown;
  overall_score: number;
  hook_explanation: string;
  cliffhanger_explanation: string;
  one_line_why_it_works: string;
  first_three_seconds: FirstThreeSecondsAnalysis;
  cliffhanger: CliffhangerAnalysis;
  editorial_insight: string;
  audience_motivation: string;
  publishing_slate_rationale: string;
  context_prerequisites: string[];
  editor_review_checklist: string[];
  confidence_score: number;
  human_feedback: HumanFeedback;
}

export interface Character {
  id: string;
  name: string;
  canonical_name: string;
  role: string;
  aliases: string[];
  description: string;
  key_traits: string[];
  total_lines: number;
  first_episode: number;
}

export interface Relationship {
  source: string;
  target: string;
  relation_type: string;
  description: string;
  dynamics: string;
}

export interface StoryArc {
  id: string;
  title: string;
  episode_start: number;
  episode_end: number;
  summary: string;
  core_conflict: string;
  key_revelations: string[];
  emotional_tone: string;
  prominence_weight: number;
}

export interface NarrativeNode {
  id: string;
  label: string;
  node_type: string;
  metadata: Record<string, string>;
}

export interface NarrativeEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  episode?: number | null;
}

export interface NarrativeGraph {
  nodes: NarrativeNode[];
  edges: NarrativeEdge[];
  arcs: StoryArc[];
  characters: Character[];
  relationships: Relationship[];
}

export interface ValidationCheckResult {
  check_name: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
  details: string;
  affected_promo_ids: string[];
}

export interface PromoFailureCase {
  id: string;
  title: string;
  failure_mode: string;
  episode: number;
  timestamps: string;
  initial_score: number;
  true_editorial_rating: string;
  why_it_failed: string;
  how_system_identified_it: string;
  remediation_suggestion: string;
}

export interface QualityControlReport {
  total_candidates_generated: number;
  total_promos_ranked: number;
  duration_valid_count: number;
  duration_violation_count: number;
  timestamp_valid_count: number;
  timestamp_violation_count: number;
  zero_hallucination_verified: boolean;
  traceability_rate_percent: number;
  duplicate_suppression_count: number;
  checks: ValidationCheckResult[];
  failure_cases: PromoFailureCase[];
}

export interface ShowSummary {
  show_title: string;
  total_episodes: number;
  total_runtime_seconds: number;
  candidates_discovered: number;
  high_quality_promos: number;
  average_promo_score: number;
  story_arcs_count: number;
  quality_checks_passed: number;
  arc_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  top_promo?: RankedPromo | null;
}

