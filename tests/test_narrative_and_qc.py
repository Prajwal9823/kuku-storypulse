import unittest
import os
import sys
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.models.screenplay import Show, Episode, Scene, ScreenplayEvent, EventType
from app.narrative.narrative_engine import NarrativeEngine
from app.evaluation.quality_auditor import QualityAuditor
from app.models.promo import RankedPromo


class TestNarrativeAndQC(unittest.TestCase):
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
        ev2 = ScreenplayEvent(
            id="e2",
            episode_number=1,
            scene_number=1,
            raw_header="SCENE 1",
            event_type=EventType.DIALOGUE,
            speaker="ALEXANDER",
            delivery="Cold",
            content="The Ashburn regiment will hold the gates.",
            start_time=5.0,
            end_time=25.0,
            start_str="00:05.00",
            end_str="00:25.00",
            duration=20.0,
        )
        scene = Scene(
            scene_number=1,
            heading="INT. HALL - DAY",
            start_time=0.0,
            end_time=25.0,
            start_str="00:00.00",
            end_str="00:25.00",
            duration=25.0,
            events=[ev1, ev2],
        )
        episode = Episode(
            episode_id="ep_01",
            episode_number=1,
            title="Ep 1",
            logline="Test logline",
            continuity_notes="None",
            scenes=[scene],
            total_duration=25.0,
        )
        self.show = Show(
            show_id="test_show",
            title="Test Show",
            episodes=[episode],
            total_episodes=1,
            total_runtime_seconds=25.0,
        )

    def test_narrative_engine_construction(self):
        engine = NarrativeEngine(self.show)
        self.assertIsNotNone(engine.graph)
        char_names = [c.name for c in engine.graph.characters]
        self.assertTrue(any("Juliana" in name for name in char_names))
        self.assertTrue(any("Alexander" in name for name in char_names))

    def test_quality_auditor_verification(self):
        auditor = QualityAuditor(self.show)
        promos_path = os.path.join(PROJECT_ROOT, "results", "raw_outputs", "final_ranked_promos.json")
        with open(promos_path, "r", encoding="utf-8") as f:
            promo = RankedPromo(**json.load(f)[0])

        report = auditor.audit_promos([promo], total_candidates_generated=100)
        self.assertEqual(report.total_promos_ranked, 1)
        self.assertEqual(report.traceability_rate_percent, 100.0)
        self.assertEqual(len(report.checks), 10)


if __name__ == "__main__":
    unittest.main()
