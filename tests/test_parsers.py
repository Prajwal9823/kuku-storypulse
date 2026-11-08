import unittest
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.parsers.time_utils import parse_timestamp, format_timestamp, interval_jaccard
from app.parsers.screenplay_parser import parse_episode_text


class TestParsers(unittest.TestCase):
    def test_parse_timestamp_standard(self):
        self.assertEqual(parse_timestamp("00:00.00"), 0.0)
        self.assertAlmostEqual(parse_timestamp("01:23.45"), 83.45, places=2)
        self.assertAlmostEqual(parse_timestamp("02:00.00"), 120.0, places=2)

    def test_parse_timestamp_edge_cases(self):
        self.assertAlmostEqual(parse_timestamp("00:05.10"), 5.10, places=2)
        self.assertAlmostEqual(parse_timestamp("00:45.20"), 45.20, places=2)
        with self.assertRaises(ValueError):
            parse_timestamp("invalid_time")

    def test_format_timestamp(self):
        self.assertEqual(format_timestamp(0.0), "00:00.00")
        self.assertEqual(format_timestamp(83.45), "01:23.45")
        self.assertEqual(format_timestamp(125.0), "02:05.00")

    def test_interval_jaccard(self):
        # Identical
        self.assertAlmostEqual(interval_jaccard(0.0, 30.0, 0.0, 30.0), 1.0, places=2)
        # Disjoint
        self.assertAlmostEqual(interval_jaccard(0.0, 10.0, 20.0, 30.0), 0.0, places=2)
        # Overlapping: [0, 20] and [10, 30] -> intersection 10, union 30 -> 1/3
        self.assertAlmostEqual(interval_jaccard(0.0, 20.0, 10.0, 30.0), 10.0 / 30.0, places=2)

    def test_screenplay_parser_sample(self):
        sample_text = """Episode 1: The Abandoned Bride
Episode logline: Juliana is cast out of her family home after an altar scandal.
Continuity notes: Follows prologue.

SCENE 1
Scene heading: INT. CHURCH - DAY
Scene start: 00:00.00
Scene end: 00:15.50

**GERALD (Cold, dismissive)**
Start: (00:00.00) | End: (00:08.00)
I cannot marry a woman without a dowry.

**JULIANA (Shocked, tears streaming)**
Start: (00:08.00) | End: (00:15.50)
You gave your word before God and the King!
"""
        episode = parse_episode_text(sample_text, filename="Episode 1.txt")
        self.assertEqual(episode.episode_number, 1)
        self.assertEqual(len(episode.scenes), 1)
        self.assertEqual(len(episode.scenes[0].events), 2)

        # Verify dialogue and delivery extraction
        dialogue_events = [e for e in episode.scenes[0].events if e.event_type.value == "dialogue"]
        self.assertEqual(len(dialogue_events), 2)
        self.assertEqual(dialogue_events[0].speaker, "GERALD")
        self.assertIn("Cold", dialogue_events[0].delivery)
        self.assertIn("cannot marry", dialogue_events[0].content)


if __name__ == "__main__":
    unittest.main()
