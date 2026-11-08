"""
Promo DNA Scoring Engine.
Calculates 7-dimensional explainable Promo DNA scores (0-100),
evaluates First-3-Seconds scroll-stopping hooks with timestamp trimming suggestions,
analyzes unresolved cliffhangers, and applies diagnostic penalties.
"""

from typing import List, Dict, Optional, Tuple, Set
from app.models.screenplay import ScreenplayEvent
from app.models.promo import (
    PromoSegment,
    ScoreBreakdown,
    FirstThreeSecondsAnalysis,
    CliffhangerAnalysis,
)
from app.candidates.candidate_generator import RawCandidate
from app.narrative.narrative_engine import NarrativeEngine, resolve_canonical_character


class ScoringWeights:
    """Configurable scoring weights summing to 1.0."""
    def __init__(
        self,
        hook: float = 0.22,
        cliffhanger: float = 0.22,
        standalone: float = 0.18,
        emotion: float = 0.12,
        conflict: float = 0.10,
        visual: float = 0.08,
        novelty: float = 0.08,
    ):
        self.hook = hook
        self.cliffhanger = cliffhanger
        self.standalone = standalone
        self.emotion = emotion
        self.conflict = conflict
        self.visual = visual
        self.novelty = novelty


HIGH_INTENSITY_EMOTIONS = {
    "furious", "devastated", "scornful", "cruel", "cold", "commanding",
    "defiant", "tearful", "sadistic", "arrogant", "outraged", "terrified",
    "sneering", "trembling", "breathless", "suppressed fury", "whisper"
}

HIGH_STAKES_WORDS = {
    "abandon", "marry", "wedding", "hang", "witch", "witchcraft", "poison",
    "arsenic", "murder", "traitor", "duke", "royal", "treason", "chains",
    "blood", "die", "kill", "disown", "altar", "scullery", "hearth", "execute"
}


class PromoDNAScorer:
    """Calculates comprehensive explainable scores for promo candidates."""

    def __init__(self, narrative_engine: NarrativeEngine, weights: Optional[ScoringWeights] = None):
        self.narrative_engine = narrative_engine
        self.weights = weights or ScoringWeights()

    def analyze_first_three_seconds(
        self, seg: PromoSegment
    ) -> Tuple[float, FirstThreeSecondsAnalysis]:
        """
        Analyze events strictly falling within [start_time, start_time + 3.0s].
        Returns (hook_score, analysis).
        """
        t0 = seg.start_time
        t_hook_end = t0 + 3.0

        events_in_3s = [
            e for e in seg.events
            if (e.start_time < t_hook_end and e.end_time > t0)
        ]

        score = 50.0  # Base
        hook_types = []
        scroll_reasons = []
        curiosity_gaps = []
        trim_offset = 0.0
        trim_reason = "Opening boundary is already well-centered on initial dramatic action."
        starts_with_dialogue = False
        first_spoken = None

        dialogues_in_3s = [e for e in events_in_3s if e.event_type.value == "dialogue"]
        if dialogues_in_3s:
            starts_with_dialogue = True
            d0 = dialogues_in_3s[0]
            first_spoken = f"{d0.speaker}: \"{d0.content}\""

            # Rapid vocal onset check
            delay_to_dialogue = max(0.0, d0.start_time - t0)
            if delay_to_dialogue <= 0.8:
                score += 25.0
                scroll_reasons.append(f"Immediate shocking verbal confrontation within {delay_to_dialogue:.1f}s.")
            elif delay_to_dialogue > 2.0:
                score -= 10.0
                trim_offset = round(delay_to_dialogue - 0.3, 2)
                trim_reason = f"Initial {delay_to_dialogue:.1f}s is silent pacing. Trimming {trim_offset}s hits the spoken hook instantly."

            if d0.delivery:
                deliv_low = d0.delivery.lower()
                if any(em in deliv_low for em in HIGH_INTENSITY_EMOTIONS):
                    score += 15.0
                    scroll_reasons.append(f"Intense vocal delivery ({d0.delivery}).")

            content_low = d0.content.lower()
            if any(w in content_low for w in HIGH_STAKES_WORDS):
                score += 15.0
                scroll_reasons.append("High-stakes premise keyword in first sentence.")
                hook_types.append("High-Stakes Accusation/Ultimatum")

            if "?" in d0.content:
                curiosity_gaps.append(f"Immediate provocative question: '{d0.content}'")
            else:
                curiosity_gaps.append(f"Dramatic assertion '{d0.content}' compels viewer to witness counter-reaction.")

        else:
            # Action/Camera only in first 3s
            action_in_3s = [e for e in events_in_3s if e.event_type.value in ("action", "camera")]
            action_text = " ".join([e.content.lower() for e in action_in_3s])
            if any(w in action_text for w in ["explosion", "shatters", "blood", "kneels", "doors part", "fury", "lacerations"]):
                score += 20.0
                hook_types.append("Visual Physical Shock")
                scroll_reasons.append("Immediate visual shock / physical motion stops the feed.")
                curiosity_gaps.append("Viewer pauses to interpret the sudden violent/emotional spectacle.")
            else:
                score -= 15.0
                hook_types.append("Slow Atmospheric Setup")
                scroll_reasons.append("Visual atmosphere without immediate conflict.")
                curiosity_gaps.append("Low immediate urgency in opening seconds.")
                trim_offset = 1.0
                trim_reason = "Consider jumping directly to first dialogue beat to prevent viewer drop-off."

        if not hook_types:
            hook_types.append("Dramatic Character Entry")
        if not scroll_reasons:
            scroll_reasons.append("Clear visual focus and narrative tension establish immediate intrigue.")
        if not curiosity_gaps:
            curiosity_gaps.append("Viewer desires to know what consequences follow this opening moment.")

        hook_score = max(20.0, min(100.0, score))

        analysis = FirstThreeSecondsAnalysis(
            duration_analyzed=3.0,
            first_events=events_in_3s[:4],
            primary_hook_type=hook_types[0],
            scroll_stopping_reason=" ".join(scroll_reasons),
            curiosity_gap=" ".join(curiosity_gaps),
            recommended_trim_offset=trim_offset,
            trim_recommendation_reason=trim_reason,
            starts_with_dialogue=starts_with_dialogue,
            first_spoken_line=first_spoken,
        )

        return hook_score, analysis

    def analyze_cliffhanger(
        self, seg: PromoSegment
    ) -> Tuple[float, CliffhangerAnalysis]:
        """
        Analyze events in the final 4 seconds of the candidate for unresolved narrative tension.
        Returns (cliffhanger_score, analysis).
        """
        t_end = seg.end_time
        t_cliff_start = max(seg.start_time, t_end - 4.0)

        final_events = [
            e for e in seg.events
            if (e.end_time > t_cliff_start and e.start_time <= t_end)
        ]

        score = 50.0
        cliff_types = []
        tensions = []
        sound_cue = False
        last_spoken = None
        urgency = "Viewer is propelled forward to see how this dramatic clash resolves."

        # Check for sound FX cliffhanger or cut to black
        for ev in final_events:
            content_low = ev.content.lower()
            if ev.event_type.value == "sound_fx":
                if "cliffhanger" in content_low or "drone" in content_low or "swell" in content_low:
                    sound_cue = True
                    score += 25.0
                    tensions.append("Ominous string drone swells to an unresolved peak.")
            if ev.event_type.value == "camera":
                if "cut to black" in content_low:
                    score += 15.0
                    tensions.append("Cinematic cut to black freezes the action at peak intensity.")

        dialogues = [e for e in final_events if e.event_type.value == "dialogue"]
        if dialogues:
            d_last = dialogues[-1]
            last_spoken = f"{d_last.speaker}: \"{d_last.content}\""
            content_low = d_last.content.lower()

            if d_last.content.endswith("?"):
                score += 20.0
                cliff_types.append("Unanswered Question Climax")
                tensions.append(f"Final dialogue cuts on an unanswered question ('{d_last.content}').")
                urgency = "Episode cuts before the question is answered, creating a powerful completion drive."
            elif any(w in content_low for w in ["never", "kill", "hang", "traitor", "bastard", "burn", "true duke", "stop"]):
                score += 20.0
                cliff_types.append("Unresolved Defiant Ultimatum")
                tensions.append(f"Cuts on high-stakes ultimatum ('{d_last.content}').")
                urgency = "Viewer must watch the next episode to see if the threat is executed."
            else:
                score += 10.0
                cliff_types.append("High Tension Dialogue Cut")
                tensions.append("Scene terminates mid-conversation before character reply.")
        else:
            action_text = " ".join([e.content.lower() for e in final_events])
            if "defiance" in action_text or "fury" in action_text or "knuckles" in action_text:
                score += 15.0
                cliff_types.append("Emotional Defiance Freeze")
                tensions.append("Heroine's expression hardens into resolute defiance as the scene cuts.")
            else:
                score -= 10.0
                cliff_types.append("Atmospheric Scene End")
                tensions.append("Scene concludes with visual movement rather than sharp vocal climax.")

        if not cliff_types:
            cliff_types.append("Mid-Scene Narrative Suspension")
        if not tensions:
            tensions.append("Dramatic unresolved tension leaves the audience demanding resolution.")

        cliff_score = max(20.0, min(100.0, score))

        analysis = CliffhangerAnalysis(
            duration_analyzed=round(t_end - t_cliff_start, 2),
            final_events=final_events[-4:],
            cliffhanger_type=cliff_types[0],
            unresolved_tension=" ".join(tensions),
            sound_cue_present=sound_cue,
            last_spoken_line=last_spoken,
            next_action_urgency=urgency,
        )

        return cliff_score, analysis

    def score_candidate(self, cand: RawCandidate) -> Tuple[ScoreBreakdown, FirstThreeSecondsAnalysis, CliffhangerAnalysis]:
        """Score candidate across all 7 dimensions and compute diagnostic penalties."""
        first_seg = cand.segments[0]
        last_seg = cand.segments[-1]

        # 1. Hook (22%)
        hook_score, hook_analysis = self.analyze_first_three_seconds(first_seg)

        # 2. Cliffhanger (22%)
        cliff_score, cliff_analysis = self.analyze_cliffhanger(last_seg)

        # 3. Standalone Comprehensibility (18%)
        all_events = [ev for seg in cand.segments for ev in seg.events]
        comp_score, comp_strengths, comp_warnings = self.narrative_engine.evaluate_standalone_comprehensibility(
            first_seg.episode_number, all_events
        )

        # 4. Emotional Intensity (12%)
        dialogue_events = [e for e in all_events if e.event_type.value == "dialogue"]
        emotional_count = sum(
            1 for e in dialogue_events
            if e.delivery and any(em in e.delivery.lower() for em in HIGH_INTENSITY_EMOTIONS)
        )
        density = (emotional_count / len(dialogue_events)) if dialogue_events else 0.0
        emotion_score = min(100.0, 45.0 + density * 80.0)

        # 5. Conflict & Stakes (10%)
        speakers = {resolve_canonical_character(e.speaker) for e in dialogue_events if e.speaker}
        speakers.discard(None)
        conflict_score = 50.0
        if len(speakers) >= 2:
            conflict_score += 25.0
        # Check high-stakes words
        all_text = " ".join([e.content.lower() for e in all_events])
        high_stakes_matches = sum(1 for w in HIGH_STAKES_WORDS if w in all_text)
        conflict_score += min(25.0, high_stakes_matches * 5.0)
        conflict_score = min(100.0, conflict_score)

        # 6. Visual Storytelling Potential (8%)
        camera_events = [e for e in all_events if e.event_type.value == "camera"]
        camera_text = " ".join([e.content.lower() for e in camera_events])
        dynamic_moves = sum(1 for m in ["close-up", "push-in", "tracking", "extreme close-up", "wide shot", "insert"] if m in camera_text)
        visual_score = min(100.0, 50.0 + dynamic_moves * 8.0)

        # 7. Curiosity & Novelty (8%)
        novelty_score = 60.0
        if cand.is_multi_segment:
            novelty_score += 25.0  # Assembled multi-segment promos have high novelty
        arc = self.narrative_engine.get_arc_for_episode(first_seg.episode_number)
        novelty_score += arc.prominence_weight * 12.0
        novelty_score = min(100.0, novelty_score)

        # Diagnostic Penalties
        penalties: Dict[str, float] = {}
        if hook_score < 40.0:
            penalties["slow_opening"] = 8.0
        if cliff_score < 40.0:
            penalties["weak_unresolved_ending"] = 8.0
        if comp_score < 45.0:
            penalties["high_lore_dependency"] = 10.0
        if not dialogue_events:
            penalties["lacks_verbal_anchoring"] = 12.0

        total_penalty = sum(penalties.values())

        raw_score = (
            self.weights.hook * hook_score +
            self.weights.cliffhanger * cliff_score +
            self.weights.standalone * comp_score +
            self.weights.emotion * emotion_score +
            self.weights.conflict * conflict_score +
            self.weights.visual * visual_score +
            self.weights.novelty * novelty_score
        )

        total_score = max(10.0, min(100.0, round(raw_score - total_penalty, 1)))

        breakdown = ScoreBreakdown(
            hook_score=round(hook_score, 1),
            cliffhanger_score=round(cliff_score, 1),
            standalone_score=round(comp_score, 1),
            emotion_score=round(emotion_score, 1),
            conflict_score=round(conflict_score, 1),
            visual_score=round(visual_score, 1),
            novelty_score=round(novelty_score, 1),
            penalties=penalties,
            penalty_total=round(total_penalty, 1),
            total_score=total_score,
        )

        return breakdown, hook_analysis, cliff_analysis

