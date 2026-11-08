"""
End-to-end CLI Pipeline Runner for KUKU STORYPULSE.
Runs screenplay parsing, narrative intelligence, candidate generation,
Promo DNA scoring, diversity ranking (MMR), quality control auditing,
and exports all unedited raw outputs and the 2-page Solution Document.
"""

import os
import sys
import time
import uuid

# Ensure backend directory is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.parsers.screenplay_parser import parse_show_directory, parse_show_zip
from app.narrative.narrative_engine import NarrativeEngine
from app.candidates.candidate_generator import CandidateGenerator
from app.scoring.scoring_engine import PromoDNAScorer, ScoringWeights
from app.ranking.diversity_ranker import DiversityRanker
from app.evaluation.quality_auditor import QualityAuditor
from app.exports.export_service import ExportService


def run_pipeline(
    data_dir: str = "data/raw_scripts/I Married a Broken Soldier. He was a Duke",
    top_k: int = 15,
    output_dir: str = "results",
    diversity_weight: float = 0.45,
):
    if not os.path.isabs(data_dir):
        data_dir = os.path.join(PROJECT_ROOT, data_dir)
    if not os.path.isabs(output_dir):
        output_dir = os.path.join(PROJECT_ROOT, output_dir)

    print("=" * 80)
    print("🎬 KUKU STORYPULSE — AI Microdrama Promo Discovery & Ranking Pipeline")
    print("=" * 80)

    start_time = time.time()
    run_id = f"run_{datetime_now_str()}_{uuid.uuid4().hex[:6]}"

    # Step 1: Ingestion & Screenplay Parsing
    print("\n[1/6] Ingesting & Parsing Screenplays...")
    if data_dir.endswith(".zip"):
        extract_dir = os.path.join("data", "extracted_temp")
        show = parse_show_zip(data_dir, extract_dir)
    else:
        show = parse_show_directory(data_dir)

    print(f"  ✓ Ingested Show: '{show.title}'")
    print(f"  ✓ Total Episodes: {show.total_episodes}")
    print(f"  ✓ Total Runtime: {show.total_runtime_seconds:.2f}s ({show.total_runtime_seconds/60:.1f} mins)")
    total_events = sum(len(ep.all_events) for ep in show.episodes)
    print(f"  ✓ Total Timestamped Events Parsed: {total_events}")

    # Step 2: Narrative Intelligence & Knowledge Graph
    print("\n[2/6] Building Narrative Intelligence Layer & Knowledge Graph...")
    narrative_engine = NarrativeEngine(show)
    print(f"  ✓ Story Arcs Identified: {len(narrative_engine.graph.arcs)}")
    print(f"  ✓ Canonical Characters Tracked: {len(narrative_engine.graph.characters)}")
    print(f"  ✓ Interpersonal Relationships: {len(narrative_engine.graph.relationships)}")
    print(f"  ✓ Knowledge Graph Nodes: {len(narrative_engine.graph.nodes)}, Edges: {len(narrative_engine.graph.edges)}")

    # Step 3: Multi-Resolution Candidate Generation
    print("\n[3/6] Generating Candidate Windows (20s - 60s)...")
    generator = CandidateGenerator(show, min_duration=20.0, max_duration=60.0)
    candidates = generator.generate_all_candidates()
    print(f"  ✓ Total Candidate Windows Generated: {len(candidates)}")
    multi_count = sum(1 for c in candidates if c.is_multi_segment)
    print(f"  ✓ Single-Episode Continuous Windows: {len(candidates) - multi_count}")
    print(f"  ✓ Strategic Cross-Episode Assemblies: {multi_count}")

    # Step 4: Promo DNA Scoring Engine
    print("\n[4/6] Executing 7-Dimensional Promo DNA Scoring...")
    weights = ScoringWeights(
        hook=0.22, cliffhanger=0.22, standalone=0.18,
        emotion=0.12, conflict=0.10, visual=0.08, novelty=0.08
    )
    scorer = PromoDNAScorer(narrative_engine, weights=weights)

    scored_candidates = []
    for cand in candidates:
        breakdown, hook_an, cliff_an = scorer.score_candidate(cand)
        scored_candidates.append((cand, breakdown, hook_an, cliff_an))

    print(f"  ✓ Scored {len(scored_candidates)} candidates across all 7 dimensions.")

    # Step 5: Diversity-Aware Ranking (MMR)
    print(f"\n[5/6] Performing Diversity-Aware Reranking (MMR λ={1.0 - diversity_weight:.2f})...")
    ranker = DiversityRanker(narrative_engine, diversity_weight=diversity_weight)
    ranked_promos = ranker.rank_promos(scored_candidates, top_k=top_k)
    print(f"  ✓ Selected Top {len(ranked_promos)} High-Performing Diverse Promos.")

    # Step 6: Quality Control Audit & Failure Analysis
    print("\n[6/6] Running 10-Point Quality Control Audit & Failure Analysis...")
    auditor = QualityAuditor(show)
    qc_report = auditor.audit_promos(ranked_promos, total_candidates_generated=len(candidates))
    print(f"  ✓ Automated Checks Passed: {sum(1 for c in qc_report.checks if c.passed)} / {len(qc_report.checks)}")
    print(f"  ✓ Dialogue Traceability Rate: {qc_report.traceability_rate_percent}%")
    print(f"  ✓ Genuine Failure Cases Documented: {len(qc_report.failure_cases)}")

    # Export All Deliverables
    print("\n[EXPORT] Writing Raw Outputs, CSV, JSON, and Solution Document...")
    export_svc = ExportService(output_dir=output_dir)
    config_dict = {
        "diversity_weight": diversity_weight,
        "weights": {
            "hook": weights.hook,
            "cliffhanger": weights.cliffhanger,
            "standalone": weights.standalone,
            "emotion": weights.emotion,
            "conflict": weights.conflict,
            "visual": weights.visual,
            "novelty": weights.novelty,
        },
        "min_duration": 20.0,
        "max_duration": 60.0,
        "top_k": top_k,
    }
    file_paths = export_svc.export_all(
        show=show,
        narrative_graph=narrative_engine.graph,
        all_candidates=candidates,
        ranked_promos=ranked_promos,
        qc_report=qc_report,
        run_id=run_id,
        config=config_dict,
    )

    elapsed = time.time() - start_time
    print(f"  ✓ Finished in {elapsed:.2f} seconds!")

    # Print Clean Summary Table
    print("\n" + "=" * 90)
    print(f"🏆 TOP {len(ranked_promos)} RECOMMENDED PUBLISHING SLATE (KUKU STORYPULSE)")
    print("=" * 90)
    print(f"{'Rank':<5} | {'Episodes':<10} | {'Timestamps':<20} | {'Dur':<6} | {'Score':<6} | {'Category':<14} | {'Title'}")
    print("-" * 90)
    for p in ranked_promos:
        eps = ", ".join(str(s.episode_number) for s in p.segments)
        ts = f"{p.segments[0].start_str} - {p.segments[-1].end_str}"
        print(f"#{p.rank:<4} | Ep {eps:<7} | {ts:<20} | {p.total_duration:<5.1f}s | {p.overall_score:<6.1f} | {p.emotional_category:<14} | {p.title[:30]}")
    print("=" * 90)

    print("\n📁 Generated Deliverables:")
    for key, path in file_paths.items():
        print(f"  • {key:<20}: {path}")

    return show, narrative_engine, ranked_promos, qc_report


def datetime_now_str() -> str:
    import datetime
    return datetime.datetime.now().strftime("%Y%m%d_%H%M%S")


if __name__ == "__main__":
    run_pipeline()

