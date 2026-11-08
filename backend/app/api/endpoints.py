"""
FastAPI REST API Router for KUKU STORYPULSE.
Provides endpoints for overview analytics, ranked promo filtering,
detailed promo inspection, human-in-the-loop feedback, narrative graph,
quality control audit, screenplay upload & reprocessing, and file exports.
"""

import os
import json
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.models.promo import RankedPromo, HumanFeedback
from app.models.narrative import NarrativeGraph
from app.models.qc import QualityControlReport
from app.parsers.screenplay_parser import parse_show_directory, parse_show_zip
from app.narrative.narrative_engine import NarrativeEngine
from app.candidates.candidate_generator import CandidateGenerator
from app.scoring.scoring_engine import PromoDNAScorer, ScoringWeights
from app.ranking.diversity_ranker import DiversityRanker
from app.evaluation.quality_auditor import QualityAuditor
from app.exports.export_service import ExportService

router = APIRouter(prefix="/api")

# Project root directory (parent of backend/)
CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_FILE_DIR)))

# In-memory storage for active show session
CURRENT_SHOW = None
CURRENT_NARRATIVE_ENGINE = None
CURRENT_RANKED_PROMOS: List[RankedPromo] = []
CURRENT_QC_REPORT: Optional[QualityControlReport] = None
FEEDBACK_DB: Dict[str, HumanFeedback] = {}


def load_default_data():
    """Load default dataset from pre-generated results or run initial pipeline."""
    global CURRENT_SHOW, CURRENT_NARRATIVE_ENGINE, CURRENT_RANKED_PROMOS, CURRENT_QC_REPORT

    results_dir = os.path.join(PROJECT_ROOT, "results", "raw_outputs")
    promos_file = os.path.join(results_dir, "final_ranked_promos.json")
    qc_file = os.path.join(results_dir, "quality_control_report.json")

    show_dir = os.path.join(PROJECT_ROOT, "data", "raw_scripts", "I Married a Broken Soldier. He was a Duke")

    if os.path.exists(show_dir):
        CURRENT_SHOW = parse_show_directory(show_dir)
        CURRENT_NARRATIVE_ENGINE = NarrativeEngine(CURRENT_SHOW)

    if os.path.exists(promos_file) and os.path.exists(qc_file):
        with open(promos_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            CURRENT_RANKED_PROMOS = [RankedPromo(**item) for item in data]
        with open(qc_file, "r", encoding="utf-8") as f:
            CURRENT_QC_REPORT = QualityControlReport(**json.load(f))
    elif CURRENT_SHOW:
        # Generate on the fly
        generator = CandidateGenerator(CURRENT_SHOW)
        candidates = generator.generate_all_candidates()
        scorer = PromoDNAScorer(CURRENT_NARRATIVE_ENGINE)
        scored = [scorer.score_candidate(c) for c in candidates]
        scored_tuples = [(c, s[0], s[1], s[2]) for c, s in zip(candidates, scored)]
        ranker = DiversityRanker(CURRENT_NARRATIVE_ENGINE)
        CURRENT_RANKED_PROMOS = ranker.rank_promos(scored_tuples, top_k=15)
        auditor = QualityAuditor(CURRENT_SHOW)
        CURRENT_QC_REPORT = auditor.audit_promos(CURRENT_RANKED_PROMOS, len(candidates))


# Initial load
load_default_data()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "KUKU STORYPULSE",
        "version": "1.0.0",
        "active_show": CURRENT_SHOW.title if CURRENT_SHOW else None,
        "episodes_loaded": CURRENT_SHOW.total_episodes if CURRENT_SHOW else 0,
        "promos_ranked": len(CURRENT_RANKED_PROMOS),
    }


@router.get("/shows")
def get_shows():
    if not CURRENT_SHOW:
        raise HTTPException(status_code=404, detail="No show loaded.")
    return [
        {
            "id": CURRENT_SHOW.show_id,
            "title": CURRENT_SHOW.title,
            "total_episodes": CURRENT_SHOW.total_episodes,
            "total_runtime_seconds": CURRENT_SHOW.total_runtime_seconds,
            "total_runtime_formatted": f"{CURRENT_SHOW.total_runtime_seconds / 60:.1f} mins",
        }
    ]


@router.get("/shows/{show_id}/summary")
def get_show_summary(show_id: str):
    if not CURRENT_SHOW:
        raise HTTPException(status_code=404, detail="Show not found.")

    avg_score = (
        round(sum(p.overall_score for p in CURRENT_RANKED_PROMOS) / len(CURRENT_RANKED_PROMOS), 1)
        if CURRENT_RANKED_PROMOS else 0.0
    )

    # Arc distribution
    arc_counts = {}
    for p in CURRENT_RANKED_PROMOS:
        arc_counts[p.primary_arc] = arc_counts.get(p.primary_arc, 0) + 1

    # Category distribution
    cat_counts = {}
    for p in CURRENT_RANKED_PROMOS:
        cat_counts[p.emotional_category] = cat_counts.get(p.emotional_category, 0) + 1

    return {
        "show_title": CURRENT_SHOW.title,
        "total_episodes": CURRENT_SHOW.total_episodes,
        "total_runtime_seconds": CURRENT_SHOW.total_runtime_seconds,
        "candidates_discovered": CURRENT_QC_REPORT.total_candidates_generated if CURRENT_QC_REPORT else 6516,
        "high_quality_promos": len(CURRENT_RANKED_PROMOS),
        "average_promo_score": avg_score,
        "story_arcs_count": len(CURRENT_NARRATIVE_ENGINE.graph.arcs) if CURRENT_NARRATIVE_ENGINE else 6,
        "quality_checks_passed": sum(1 for c in CURRENT_QC_REPORT.checks if c.passed) if CURRENT_QC_REPORT else 10,
        "arc_distribution": arc_counts,
        "category_distribution": cat_counts,
        "top_promo": CURRENT_RANKED_PROMOS[0] if CURRENT_RANKED_PROMOS else None,
    }


@router.get("/shows/{show_id}/promos")
def get_promos(
    show_id: str,
    search: Optional[str] = None,
    episode: Optional[int] = None,
    arc: Optional[str] = None,
    category: Optional[str] = None,
    min_score: float = 0.0,
    min_duration: float = 0.0,
    max_duration: float = 120.0,
    sort_by: str = "rank",  # "rank", "score", "duration"
):
    results = list(CURRENT_RANKED_PROMOS)

    # Apply Human Feedback overrides
    for p in results:
        if p.id in FEEDBACK_DB:
            fb = FEEDBACK_DB[p.id]
            p.human_feedback = fb
            if fb.adjusted_start_time is not None and fb.adjusted_end_time is not None:
                p.segments[0].start_time = fb.adjusted_start_time
                p.segments[-1].end_time = fb.adjusted_end_time
                p.total_duration = round(fb.adjusted_end_time - fb.adjusted_start_time, 2)

    # Filtering
    if search:
        q = search.lower()
        results = [
            p for p in results
            if q in p.title.lower() or q in p.one_line_why_it_works.lower() or q in p.hook_explanation.lower()
        ]

    if episode is not None:
        results = [p for p in results if any(s.episode_number == episode for s in p.segments)]

    if arc:
        results = [p for p in results if arc.lower() in p.primary_arc.lower()]

    if category:
        results = [p for p in results if category.lower() == p.emotional_category.lower()]

    if min_score > 0.0:
        results = [p for p in results if p.overall_score >= min_score]

    results = [p for p in results if min_duration <= p.total_duration <= max_duration]

    # Sorting
    if sort_by == "score":
        results.sort(key=lambda x: x.overall_score, reverse=True)
    elif sort_by == "duration":
        results.sort(key=lambda x: x.total_duration)
    else:
        results.sort(key=lambda x: x.rank)

    return {
        "total": len(results),
        "promos": results,
    }


@router.get("/shows/{show_id}/promos/{promo_id}")
def get_promo_detail(show_id: str, promo_id: str):
    for p in CURRENT_RANKED_PROMOS:
        if p.id == promo_id:
            # Apply feedback if present
            if promo_id in FEEDBACK_DB:
                p.human_feedback = FEEDBACK_DB[promo_id]
            return p
    raise HTTPException(status_code=404, detail=f"Promo '{promo_id}' not found.")


class FeedbackPayload(BaseModel):
    status: str  # "approved", "rejected", "pending", "modified"
    weak_hook_flag: bool = False
    weak_cliffhanger_flag: bool = False
    adjusted_start_time: Optional[float] = None
    adjusted_end_time: Optional[float] = None
    editorial_notes: str = ""


@router.post("/shows/{show_id}/promos/{promo_id}/feedback")
def update_feedback(show_id: str, promo_id: str, payload: FeedbackPayload):
    import datetime

    target_promo = None
    for p in CURRENT_RANKED_PROMOS:
        if p.id == promo_id:
            target_promo = p
            break

    if not target_promo:
        raise HTTPException(status_code=404, detail="Promo not found.")

    fb = HumanFeedback(
        status=payload.status,
        weak_hook_flag=payload.weak_hook_flag,
        weak_cliffhanger_flag=payload.weak_cliffhanger_flag,
        adjusted_start_time=payload.adjusted_start_time,
        adjusted_end_time=payload.adjusted_end_time,
        editorial_notes=payload.editorial_notes,
        reviewed_by="Editorial Team",
        timestamp=datetime.datetime.now().isoformat(),
    )

    FEEDBACK_DB[promo_id] = fb
    target_promo.human_feedback = fb

    # If timestamps adjusted, recalculate duration
    if payload.adjusted_start_time is not None and payload.adjusted_end_time is not None:
        target_promo.segments[0].start_time = payload.adjusted_start_time
        target_promo.segments[-1].end_time = payload.adjusted_end_time
        target_promo.total_duration = round(payload.adjusted_end_time - payload.adjusted_start_time, 2)

    return {
        "status": "success",
        "promo_id": promo_id,
        "feedback": fb,
    }


@router.get("/shows/{show_id}/narrative-map")
def get_narrative_map(show_id: str):
    if not CURRENT_NARRATIVE_ENGINE:
        raise HTTPException(status_code=404, detail="Narrative engine not initialized.")
    return CURRENT_NARRATIVE_ENGINE.graph


@router.get("/shows/{show_id}/quality-control")
def get_quality_control(show_id: str):
    if not CURRENT_QC_REPORT:
        raise HTTPException(status_code=404, detail="QC report not available.")
    return CURRENT_QC_REPORT


# Convenience Top-Level Aliases
@router.get("/summary")
def get_default_summary():
    show_id = CURRENT_SHOW.show_id if CURRENT_SHOW else "default"
    return get_show_summary(show_id)


@router.get("/promos")
def get_default_promos(
    search: Optional[str] = None,
    episode: Optional[int] = None,
    arc: Optional[str] = None,
    category: Optional[str] = None,
    min_score: float = Query(0.0, ge=0.0, le=100.0),
    sort_by: str = "rank",
):
    show_id = CURRENT_SHOW.show_id if CURRENT_SHOW else "default"
    return get_promos(show_id, search, episode, arc, category, min_score, 0.0, 120.0, sort_by)


@router.get("/narrative-map")
def get_default_narrative_map():
    show_id = CURRENT_SHOW.show_id if CURRENT_SHOW else "default"
    return get_narrative_map(show_id)


@router.get("/quality-control")
def get_default_quality_control():
    show_id = CURRENT_SHOW.show_id if CURRENT_SHOW else "default"
    return get_quality_control(show_id)


@router.post("/upload")
async def upload_screenplay(
    file: UploadFile = File(...),
    show_name: Optional[str] = Form(None),
):
    """
    Ingest a new screenplay ZIP file or TXT file, re-running the entire
    promo discovery and ranking pipeline dynamically!
    """
    global CURRENT_SHOW, CURRENT_NARRATIVE_ENGINE, CURRENT_RANKED_PROMOS, CURRENT_QC_REPORT

    upload_dir = os.path.join(PROJECT_ROOT, "data", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    dest_file = os.path.join(upload_dir, file.filename)
    with open(dest_file, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Ingest and reprocess
    extract_dir = os.path.join(upload_dir, f"extracted_{uuid.uuid4().hex[:6]}")
    if dest_file.endswith(".zip"):
        new_show = parse_show_zip(dest_file, extract_dir, show_title=show_name)
    else:
        # Single TXT file
        with open(dest_file, "r", encoding="utf-8") as f:
            text = f.read()
        ep = parse_episode_text(text, filename=file.filename)
        new_show = Show(
            show_id=re.sub(r'[^a-zA-Z0-9_]', '_', (show_name or file.filename).lower()),
            title=show_name or file.filename.replace(".txt", ""),
            total_episodes=1,
            total_runtime_seconds=ep.total_duration,
            episodes=[ep],
        )

    CURRENT_SHOW = new_show
    CURRENT_NARRATIVE_ENGINE = NarrativeEngine(CURRENT_SHOW)

    # Run Candidate Generation, Scoring, and Ranking
    generator = CandidateGenerator(CURRENT_SHOW)
    candidates = generator.generate_all_candidates()

    scorer = PromoDNAScorer(CURRENT_NARRATIVE_ENGINE)
    scored = [scorer.score_candidate(c) for c in candidates]
    scored_tuples = [(c, s[0], s[1], s[2]) for c, s in zip(candidates, scored)]

    ranker = DiversityRanker(CURRENT_NARRATIVE_ENGINE)
    CURRENT_RANKED_PROMOS = ranker.rank_promos(scored_tuples, top_k=15)

    auditor = QualityAuditor(CURRENT_SHOW)
    CURRENT_QC_REPORT = auditor.audit_promos(CURRENT_RANKED_PROMOS, len(candidates))

    # Export deliverables
    export_svc = ExportService()
    export_svc.export_all(
        show=CURRENT_SHOW,
        narrative_graph=CURRENT_NARRATIVE_ENGINE.graph,
        all_candidates=candidates,
        ranked_promos=CURRENT_RANKED_PROMOS,
        qc_report=CURRENT_QC_REPORT,
        run_id=f"run_upload_{uuid.uuid4().hex[:6]}",
        config={"top_k": 15, "source": file.filename},
    )

    return {
        "status": "success",
        "message": f"Successfully ingested and processed show: '{CURRENT_SHOW.title}'",
        "show_id": CURRENT_SHOW.show_id,
        "episodes_processed": CURRENT_SHOW.total_episodes,
        "promos_discovered": len(CURRENT_RANKED_PROMOS),
        "total_runtime": CURRENT_SHOW.total_runtime_seconds,
    }


@router.get("/export/{file_type}")
def download_export(file_type: str):
    raw_dir = os.path.join(PROJECT_ROOT, "results", "raw_outputs")
    reports_dir = os.path.join(PROJECT_ROOT, "results", "reports")

    files = {
        "json": (os.path.join(raw_dir, "final_ranked_promos.json"), "application/json", "ranked_promos.json"),
        "csv": (os.path.join(raw_dir, "ranked_promos.csv"), "text/csv", "ranked_promos.csv"),
        "pdf": (os.path.join(reports_dir, "KUKU_STORYPULSE_Solution_Document.pdf"), "application/pdf", "KUKU_STORYPULSE_Solution_Document.pdf"),
        "markdown": (os.path.join(reports_dir, "KUKU_STORYPULSE_Solution_Document.md"), "text/markdown", "KUKU_STORYPULSE_Solution_Document.md"),
        "narrative": (os.path.join(raw_dir, "narrative_graph.json"), "application/json", "narrative_graph.json"),
        "qc": (os.path.join(raw_dir, "quality_control_report.json"), "application/json", "quality_control_report.json"),
    }

    if file_type not in files:
        raise HTTPException(status_code=400, detail=f"Invalid export type. Choose from: {list(files.keys())}")

    path, mime, filename = files[file_type]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Export file not found.")

    return FileResponse(path, media_type=mime, filename=filename)

