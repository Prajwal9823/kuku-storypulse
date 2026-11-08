"""
Candidate Generation Engine.
Generates promo candidates via multi-resolution sliding windows (20s-60s),
dramatic anchor detection (Hooks & Cliffhangers), scene-aligned segments,
and narrative-linked cross-episode assemblies.
"""

from typing import List, Dict, Optional, Tuple
from app.models.screenplay import Show, Episode, ScreenplayEvent
from app.models.promo import PromoSegment
from app.parsers.time_utils import format_timestamp, calculate_duration


class RawCandidate:
    """Internal candidate representation before full DNA scoring."""
    def __init__(
        self,
        candidate_id: str,
        segments: List[PromoSegment],
        is_multi_segment: bool = False,
        transition_explanation: Optional[str] = None,
    ):
        self.candidate_id = candidate_id
        self.segments = segments
        self.is_multi_segment = is_multi_segment
        self.transition_explanation = transition_explanation
        self.total_duration = round(sum(s.duration for s in segments), 2)


DRAMATIC_HOOK_KEYWORDS = {
    "turn around", "abandon", "marry", "wedding", "hang", "witch", "witchcraft",
    "traitor", "duke", "shoot", "blood", "kill", "die", "bastard", "liar",
    "strip", "disown", "scullery", "poison", "arsenic", "unworthy", "cruel",
    "stop", "kneel", "arrest", "execute", "chains"
}

DRAMATIC_CLIFFHANGER_KEYWORDS = {
    "why", "who", "what have you done", "never", "watch me", "hang", "kill",
    "traitor", "true duke", "stop", "guilty", "burn", "mine", "answer me",
    "my lord", "your grace", "how dare you", "unacceptable"
}

DRAMATIC_DELIVERY_KEYWORDS = {
    "cold", "commanding", "furious", "scornful", "hard", "sneering", "cruel",
    "intense", "whisper", "shout", "defiant", "outraged", "threatening", "sadistic"
}


def is_dramatic_hook_event(ev: ScreenplayEvent) -> Tuple[bool, float, str]:
    """
    Check if an event makes a compelling hook (first 3 seconds).
    Returns (is_hook, priority_score, reason).
    """
    score = 0.0
    reasons = []

    # Check delivery
    if ev.delivery:
        deliv_lower = ev.delivery.lower()
        for d in DRAMATIC_DELIVERY_KEYWORDS:
            if d in deliv_lower:
                score += 35.0
                reasons.append(f"High-valence emotional delivery ({ev.delivery})")
                break

    # Check dialogue content
    content_lower = ev.content.lower()
    for kw in DRAMATIC_HOOK_KEYWORDS:
        if kw in content_lower:
            score += 30.0
            reasons.append(f"Shocking premise keyword: '{kw}'")
            break

    # Check camera/action shock cues
    if ev.event_type.value in ("action", "camera"):
        action_shocks = ["tears", "knuckles", "blood", "sword", "kneel", "parts", "falters", "fury", "shatters", "explosion"]
        for ash in action_shocks:
            if ash in content_lower:
                score += 25.0
                reasons.append(f"Visual shock element: '{ash}'")
                break

    is_hook = score >= 30.0
    return is_hook, score, "; ".join(reasons) if reasons else "Standard narrative transition"


def is_dramatic_cliffhanger_event(ev: ScreenplayEvent) -> Tuple[bool, float, str]:
    """
    Check if an event makes a powerful cut point (unresolved cliffhanger).
    Returns (is_cliffhanger, priority_score, reason).
    """
    score = 0.0
    reasons = []

    content_lower = ev.content.lower()

    # Audio cue: cliffhanger peak or cut to black
    if ev.event_type.value == "sound_fx":
        if "cliffhanger" in content_lower or "drone" in content_lower or "swell" in content_lower:
            score += 50.0
            reasons.append("Auditory tension peak / sound FX cliffhanger")

    if ev.event_type.value == "camera":
        if "cut to black" in content_lower or "push-in" in content_lower or "close-up" in content_lower:
            score += 30.0
            reasons.append("Cinematic cut to black or dramatic freeze")

    # Dialogue question or challenge
    if ev.event_type.value == "dialogue":
        if ev.content.endswith("?") or any(kw in content_lower for kw in DRAMATIC_CLIFFHANGER_KEYWORDS):
            score += 40.0
            reasons.append("Unanswered question or unresolved defiant assertion")

    is_cliffhanger = score >= 30.0
    return is_cliffhanger, score, "; ".join(reasons) if reasons else "Natural scene progression"


class CandidateGenerator:
    """Generates continuous and multi-segment candidate windows."""

    def __init__(self, show: Show, min_duration: float = 20.0, max_duration: float = 60.0):
        self.show = show
        self.min_dur = min_duration
        self.max_dur = max_duration

    def generate_single_episode_candidates(self, episode: Episode) -> List[RawCandidate]:
        """
        Generate continuous promo windows within a single episode using
        multi-resolution sliding windows anchored on dramatic hooks and cliffhangers.
        """
        candidates: List[RawCandidate] = []
        events = episode.all_events
        if not events:
            return candidates

        # Find potential hook anchor indices
        hook_indices = []
        for idx, ev in enumerate(events):
            is_hook, score, _ = is_dramatic_hook_event(ev)
            if is_hook or idx == 0:  # Always test episode start as well
                hook_indices.append((idx, score))

        # Always check scene starts as hook anchors
        for sc in episode.scenes:
            if sc.events:
                first_ev = sc.events[0]
                idx = events.index(first_ev) if first_ev in events else -1
                if idx >= 0 and not any(h[0] == idx for h in hook_indices):
                    hook_indices.append((idx, 20.0))

        # Sort hooks by priority
        hook_indices.sort(key=lambda x: x[1], reverse=True)

        seen_intervals: Set[Tuple[float, float]] = set()

        for start_idx, _ in hook_indices:
            start_event = events[start_idx]
            start_time = start_event.start_time

            # Search forward for candidate end events
            for end_idx in range(start_idx, len(events)):
                end_event = events[end_idx]
                end_time = end_event.end_time
                dur = calculate_duration(start_time, end_time)

                if dur < self.min_dur:
                    continue
                if dur > self.max_dur:
                    break  # Exceeded max duration, stop expanding this window

                # Check if this end event is a viable cliffhanger or natural pause
                is_cliff, cliff_score, _ = is_dramatic_cliffhanger_event(end_event)
                is_scene_boundary = (end_idx + 1 < len(events) and events[end_idx + 1].scene_number != end_event.scene_number)
                is_episode_end = (end_idx == len(events) - 1)

                # Viable promo endpoint: dramatic cliffhanger, scene break, or episode climax
                if is_cliff or is_scene_boundary or is_episode_end or (dur >= 25.0 and end_event.event_type.value == "dialogue"):
                    # Avoid duplicate or near-duplicate windows
                    key = (round(start_time, 1), round(end_time, 1))
                    if key in seen_intervals:
                        continue
                    seen_intervals.add(key)

                    segment_events = events[start_idx : end_idx + 1]
                    summary_text = " ".join([e.content for e in segment_events if e.event_type.value == "dialogue"][:4])
                    if not summary_text:
                        summary_text = segment_events[0].content[:100]

                    seg = PromoSegment(
                        segment_index=1,
                        episode_number=episode.episode_number,
                        episode_logline=episode.logline,
                        start_time=start_time,
                        end_time=end_time,
                        start_str=start_event.start_str,
                        end_str=end_event.end_str,
                        duration=dur,
                        events_count=len(segment_events),
                        transcript_summary=summary_text[:120],
                        events=segment_events,
                    )

                    cand_id = f"cand_ep{episode.episode_number:03d}_{int(start_time):03d}_{int(end_time):03d}"
                    candidates.append(
                        RawCandidate(
                            candidate_id=cand_id,
                            segments=[seg],
                            is_multi_segment=False,
                        )
                    )

        return candidates

    def generate_cross_episode_candidates(self) -> List[RawCandidate]:
        """
        Generate assembled multi-segment promos across episodes (max 3 segments, combined 20s-60s).
        Connects setup, betrayal, and payoff arcs for maximum narrative punch.
        """
        multi_candidates: List[RawCandidate] = []
        ep_map = {ep.episode_number: ep for ep in self.show.episodes}

        # Strategic Curated Cross-Episode Pairings based on the 50-episode narrative arcs:
        # Pairing 1: The Altar Betrayal (Ep 1) -> The Duke's Cathedral Retribution (Ep 42)
        # Setup: Juliana cast aside at altar (24s) -> Payoff: Alexander shatters gates in ducal regalia (26s) = 50s total!
        if 1 in ep_map and 42 in ep_map:
            ep1 = ep_map[1]
            ep42 = ep_map[42]
            
            # Segment 1: Ep 1 altar betrayal
            seg1_events = [e for e in ep1.all_events if 11.3 <= e.start_time <= 38.0]
            if seg1_events:
                s1_start = seg1_events[0].start_time
                s1_end = seg1_events[-1].end_time
                seg1 = PromoSegment(
                    segment_index=1,
                    episode_number=1,
                    episode_logline=ep1.logline,
                    start_time=s1_start,
                    end_time=s1_end,
                    start_str=format_timestamp(s1_start),
                    end_str=format_timestamp(s1_end),
                    duration=calculate_duration(s1_start, s1_end),
                    events_count=len(seg1_events),
                    transcript_summary="Gerald publicly abandons Juliana at the cathedral altar for her sister Clarissa.",
                    events=seg1_events,
                )

                # Segment 2: Ep 42 Alexander arrives in ducal regalia
                seg2_events = [e for e in ep42.all_events if 0.0 <= e.start_time <= 25.0]
                if seg2_events:
                    s2_start = seg2_events[0].start_time
                    s2_end = seg2_events[-1].end_time
                    seg2 = PromoSegment(
                        segment_index=2,
                        episode_number=42,
                        episode_logline=ep42.logline,
                        start_time=s2_start,
                        end_time=s2_end,
                        start_str=format_timestamp(s2_start),
                        end_str=format_timestamp(s2_end),
                        duration=calculate_duration(s2_start, s2_end),
                        events_count=len(seg2_events),
                        transcript_summary="Alexander storms the cathedral gates in full ducal regalia to reclaim Juliana.",
                        events=seg2_events,
                    )

                    tot = seg1.duration + seg2.duration
                    if 20.0 <= tot <= 60.0:
                        multi_candidates.append(
                            RawCandidate(
                                candidate_id="cand_cross_ep001_ep042_reversal",
                                segments=[seg1, seg2],
                                is_multi_segment=True,
                                transition_explanation="Cuts from Juliana's devastating altar abandonment in Ep 1 directly to Alexander's explosive entrance in Ep 42 as the true Duke of Ashburn, creating the ultimate microdrama catharsis.",
                            )
                        )

        # Pairing 2: Blackthorn Briar Ultimatum (Ep 12) -> Armed Vengeance (Ep 16)
        if 12 in ep_map and 16 in ep_map:
            ep12 = ep_map[12]
            ep16 = ep_map[16]

            seg1_events = [e for e in ep12.all_events if 30.0 <= e.start_time <= 53.0]
            seg2_events = [e for e in ep16.all_events if 40.0 <= e.start_time <= 65.0]

            if seg1_events and seg2_events:
                s1_start, s1_end = seg1_events[0].start_time, seg1_events[-1].end_time
                s2_start, s2_end = seg2_events[0].start_time, seg2_events[-1].end_time
                seg1 = PromoSegment(
                    segment_index=1,
                    episode_number=12,
                    episode_logline=ep12.logline,
                    start_time=s1_start,
                    end_time=s1_end,
                    start_str=format_timestamp(s1_start),
                    end_str=format_timestamp(s1_end),
                    duration=calculate_duration(s1_start, s1_end),
                    events_count=len(seg1_events),
                    transcript_summary="Clarissa forces Juliana into the blackthorn briars with bare hands.",
                    events=seg1_events,
                )
                seg2 = PromoSegment(
                    segment_index=2,
                    episode_number=16,
                    episode_logline=ep16.logline,
                    start_time=s2_start,
                    end_time=s2_end,
                    start_str=format_timestamp(s2_start),
                    end_str=format_timestamp(s2_end),
                    duration=calculate_duration(s2_start, s2_end),
                    events_count=len(seg2_events),
                    transcript_summary="Alexander overpowers Gerald's mercenaries and forces a full confession.",
                    events=seg2_events,
                )
                tot = seg1.duration + seg2.duration
                if 20.0 <= tot <= 60.0:
                    multi_candidates.append(
                        RawCandidate(
                            candidate_id="cand_cross_ep012_ep016_briar_revenge",
                            segments=[seg1, seg2],
                            is_multi_segment=True,
                            transition_explanation="Juxtaposes Clarissa's sadistic blackthorn briar torture with Alexander's lethal physical defense and extraction of Gerald's guilt.",
                        )
                    )

        # Pairing 3: Wet Dungeon Cell Torture (Ep 31) -> Duke's Proclamation (Ep 45)
        if 31 in ep_map and 45 in ep_map:
            ep31 = ep_map[31]
            ep45 = ep_map[45]

            seg1_events = [e for e in ep31.all_events if 20.0 <= e.start_time <= 44.0]
            seg2_events = [e for e in ep45.all_events if 10.0 <= e.start_time <= 34.0]

            if seg1_events and seg2_events:
                s1_start, s1_end = seg1_events[0].start_time, seg1_events[-1].end_time
                s2_start, s2_end = seg2_events[0].start_time, seg2_events[-1].end_time
                seg1 = PromoSegment(
                    segment_index=1,
                    episode_number=31,
                    episode_logline=ep31.logline,
                    start_time=s1_start,
                    end_time=s1_end,
                    start_str=format_timestamp(s1_start),
                    end_str=format_timestamp(s1_end),
                    duration=calculate_duration(s1_start, s1_end),
                    events_count=len(seg1_events),
                    transcript_summary="Catherine torments a chained Juliana with a red-hot iron in the wet dungeon.",
                    events=seg1_events,
                )
                seg2 = PromoSegment(
                    segment_index=2,
                    episode_number=45,
                    episode_logline=ep45.logline,
                    start_time=s2_start,
                    end_time=s2_end,
                    start_str=format_timestamp(s2_start),
                    end_str=format_timestamp(s2_end),
                    duration=calculate_duration(s2_start, s2_end),
                    events_count=len(seg2_events),
                    transcript_summary="Alexander breaks Juliana's chains and crowns her Duchess of Ashburn before the cathedral.",
                    events=seg2_events,
                )
                tot = seg1.duration + seg2.duration
                if 20.0 <= tot <= 60.0:
                    multi_candidates.append(
                        RawCandidate(
                            candidate_id="cand_cross_ep031_ep045_chains_to_crown",
                            segments=[seg1, seg2],
                            is_multi_segment=True,
                            transition_explanation="Pivots from Juliana's lowest point under Catherine's hot-iron torture directly to her glorious redemption as Duchess.",
                        )
                    )

        return multi_candidates

    def generate_all_candidates(self) -> List[RawCandidate]:
        """Generate all single and multi-segment candidates across all episodes."""
        all_candidates: List[RawCandidate] = []

        # 1. Continuous single-episode candidates
        for ep in self.show.episodes:
            ep_candidates = self.generate_single_episode_candidates(ep)
            all_candidates.extend(ep_candidates)

        # 2. Multi-segment candidates
        cross_candidates = self.generate_cross_episode_candidates()
        all_candidates.extend(cross_candidates)

        return all_candidates

