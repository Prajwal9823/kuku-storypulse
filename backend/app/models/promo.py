"""
Promo candidate, scoring, and ranked promo models.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.models.screenplay import ScreenplayEvent


class PromoSegment(BaseModel):
    segment_index: int
    episode_number: int
    episode_logline: Optional[str] = None
    start_time: float
    end_time: float
    start_str: str
    end_str: str
    duration: float
    events_count: int
    transcript_summary: str
    events: List[ScreenplayEvent] = Field(default_factory=list)


class FirstThreeSecondsAnalysis(BaseModel):
    duration_analyzed: float = 3.0
    first_events: List[ScreenplayEvent] = Field(default_factory=list)
    primary_hook_type: str  # e.g., "Altar Abandonment Betrayal", "Lethal Weapon Draw", "Public Humiliation"
    scroll_stopping_reason: str
    curiosity_gap: str
    recommended_trim_offset: float = 0.0  # e.g., 0.5s if cutting initial silence
    trim_recommendation_reason: str
    starts_with_dialogue: bool = False
    first_spoken_line: Optional[str] = None


class CliffhangerAnalysis(BaseModel):
    duration_analyzed: float = 4.0
    final_events: List[ScreenplayEvent] = Field(default_factory=list)
    cliffhanger_type: str  # e.g., "Interrupted Revelation", "Sudden Threat", "Dramatic Defiance", "Witness Caught"
    unresolved_tension: str
    sound_cue_present: bool = False
    last_spoken_line: Optional[str] = None
    next_action_urgency: str  # Why viewer must watch Episode N+1


class ScoreBreakdown(BaseModel):
    hook_score: float = Field(..., description="Opening 3 seconds hook strength (0-100, wt 0.22)")
    cliffhanger_score: float = Field(..., description="Unresolved cliffhanger ending (0-100, wt 0.22)")
    standalone_score: float = Field(..., description="Self-contained clarity for new viewers (0-100, wt 0.18)")
    emotion_score: float = Field(..., description="Emotional intensity and delivery tags (0-100, wt 0.12)")
    conflict_score: float = Field(..., description="Stakes and opposing dramatic forces (0-100, wt 0.10)")
    visual_score: float = Field(..., description="Camera dynamics and visual staging (0-100, wt 0.08)")
    novelty_score: float = Field(..., description="Curiosity gap & unique microdrama tropes (0-100, wt 0.08)")
    
    penalties: Dict[str, float] = Field(default_factory=dict)
    penalty_total: float = 0.0
    total_score: float = Field(..., description="Weighted composite score after penalties (0-100)")


class HumanFeedback(BaseModel):
    status: str = "pending"  # "pending", "approved", "rejected", "modified"
    weak_hook_flag: bool = False
    weak_cliffhanger_flag: bool = False
    adjusted_start_time: Optional[float] = None
    adjusted_end_time: Optional[float] = None
    editorial_notes: str = ""
    reviewed_by: Optional[str] = None
    timestamp: Optional[str] = None


class RankedPromo(BaseModel):
    id: str
    rank: int
    publishing_priority: int
    title: str
    primary_arc: str
    emotional_category: str  # "Betrayal", "Revenge", "Romance", "Reveal", "Suspense", "Confrontation", "Mystery"
    is_multi_segment: bool
    segments: List[PromoSegment]
    total_duration: float
    score_breakdown: ScoreBreakdown
    overall_score: float
    
    # Kuku Required Core Explanations:
    hook_explanation: str
    cliffhanger_explanation: str
    one_line_why_it_works: str
    
    # Advanced Editorial & Publishing Intelligence:
    first_three_seconds: FirstThreeSecondsAnalysis
    cliffhanger: CliffhangerAnalysis
    editorial_insight: str
    audience_motivation: str  # "Schadenfreude & justice revenge seeking", "Forbidden romance tension", etc.
    publishing_slate_rationale: str
    context_prerequisites: List[str] = Field(default_factory=list)
    editor_review_checklist: List[str] = Field(default_factory=list)
    confidence_score: float = 0.95
    human_feedback: HumanFeedback = Field(default_factory=HumanFeedback)

