import unittest
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.scoring.scoring_engine import ScoringWeights, PromoDNAScorer
from app.ranking.diversity_ranker import DiversityRanker
from app.candidates.candidate_generator import RawCandidate
from app.models.promo import PromoSegment
from app.models.screenplay import Show, Episode, Scene, ScreenplayEvent, EventType
from app.narrative.narrative_engine import NarrativeEngine


class TestScoringAndRanking(unittest.TestCase):
    def setUp(self):
        ev1 = ScreenplayEvent(
            id="e1",
            episode_number=1,
            scene_number=1,
            raw_header="SCENE 1",
            event_type=EventType.DIALOGUE,
            speaker="JULIANA",
            delivery="Furious",
            content="Gerald, you lied to the entire duchy!",
            start_time=0.0,
            end_time=5.0,
            start_str="00:00.00",
            end_str="00:05.00",
            duration=5.0,
        )
        scene = Scene(
            scene_number=1,
            heading="INT. HALL - DAY",
            start_time=0.0,
            end_time=5.0,
            start_str="00:00.00",
            end_str="00:05.00",
            duration=5.0,
            events=[ev1],
        )
        episode = Episode(
            episode_id="ep_01",
            episode_number=1,
            title="Ep 1",
            logline="Test logline",
            continuity_notes="None",
            scenes=[scene],
            total_duration=5.0,
        )
        self.show = Show(
            show_id="test_show",
            title="Test Show",
            episodes=[episode],
            total_episodes=1,
            total_runtime_seconds=5.0,
        )
        self.narrative_engine = NarrativeEngine(self.show)

    def test_scoring_weights_sum(self):
        weights = ScoringWeights()
        total_weight = (
            weights.hook
            + weights.cliffhanger
            + weights.standalone
            + weights.emotion
            + weights.conflict
            + weights.visual
            + weights.novelty
        )
        self.assertAlmostEqual(total_weight, 1.00, places=4)

    def test_score_candidate(self):
        scorer = PromoDNAScorer(self.narrative_engine)
        seg = PromoSegment(
            segment_index=1,
            episode_number=1,
            episode_logline="Test logline",
            start_time=0.0,
            end_time=25.0,
            start_str="00:00.00",
            end_str="00:25.00",
            duration=25.0,
            events_count=1,
            transcript_summary="Confrontation",
            events=self.show.episodes[0].scenes[0].events,
        )
        cand = RawCandidate("cand_01", [seg])
        score, hook_an, cliff_an = scorer.score_candidate(cand)
        self.assertGreaterEqual(score.total_score, 0.0)
        self.assertLessEqual(score.total_score, 100.0)
        self.assertIsNotNone(hook_an)
        self.assertIsNotNone(cliff_an)

    def test_diversity_ranker(self):
        scorer = PromoDNAScorer(self.narrative_engine)
        ranker = DiversityRanker(self.narrative_engine, diversity_weight=0.45)
        seg = PromoSegment(
            segment_index=1,
            episode_number=1,
            episode_logline="Test logline",
            start_time=0.0,
            end_time=25.0,
            start_str="00:00.00",
            end_str="00:25.00",
            duration=25.0,
            events_count=1,
            transcript_summary="Confrontation",
            events=self.show.episodes[0].scenes[0].events,
        )
        cand = RawCandidate("cand_01", [seg])
        score, hook_an, cliff_an = scorer.score_candidate(cand)

        ranked = ranker.rank_promos([(cand, score, hook_an, cliff_an)], top_k=1)
        self.assertEqual(len(ranked), 1)
        self.assertEqual(ranked[0].rank, 1)
        self.assertGreater(ranked[0].overall_score, 0.0)


if __name__ == "__main__":
    unittest.main()
