# KUKU STORYPULSE
### *Turn Every Story Into Its Next Viral Hook*

Production-grade AI-powered microdrama promo discovery, scoring, and diversity-ranking platform built for the **Kuku AI Generalist Assignment — Problem 1: Find the Promos (Ads)**.

---

## 🌟 Executive Overview

**Kuku StoryPulse** transforms full-season screenplay packs into a ranked, diversified collection of publication-ready promotional video ads (20–60 seconds). Built to feel like a high-end internal editorial intelligence tool at a premier global streaming network, it automates the tedious search for viral moments while giving human creative directors transparent mathematical explainability and granular timeline control.

Tested and validated end-to-end on the complete **50-episode screenplay pack** of *"I Married a Broken Soldier. He was a Duke"* (3,727 events, 6,162.62 seconds of story runtime).

---

## 🚀 Key Architectural Innovations

### 1. Robust Screenplay & Sub-Second Timestamp Parser
- Ingests raw `.txt` / screenplay files and extracts Scene Numbers, Headings, Timestamps (`MM:SS.xx`), Dialogue, Speaker Delivery tags, Physical Actions, Camera Angles, and Sound FX.
- Handles simultaneous/overlapping dialogue and camera cues without drift or truncation.
- 100% dialogue and timestamp traceability back to the source screenplay files (Zero hallucination guarantee).

### 2. Narrative Intelligence Engine & Knowledge Graph
- Automatically constructs a story-level graph tracking:
  $$\text{Character} \longrightarrow \text{Event} \longrightarrow \text{Conflict} \longrightarrow \text{Consequence}$$
- Maps character relationships, hidden identity arcs, betrayal events, and stakes.
- Evaluates **Standalone Comprehensibility**: ensures promos make complete sense to a first-time viewer without prior story knowledge, penalizing dangling pronouns or unexplained references.

### 3. Multi-Resolution Sliding-Window Candidate Generator
- Explores 20.0s to 60.0s candidate windows across all episodes (generated 6,516 total candidates).
- Dynamically anchors window starts on shock moments, confrontations, and high-energy dialogue lines.
- Anchors cut points on cliffhanger peaks (interrupted reveals, gasps, unanswered questions, dramatic exits).
- Generates strategic **cross-episode multi-segment assemblies** (max 3 segments, 20–60s total) for powerful cause-and-effect pairings (e.g., betrayal setup in Ep 1 paired with high-stakes confrontation in Ep 50).

### 4. 7-Dimension Promo DNA Scoring Formula
Every candidate receives a normalized score ($0 - 100$) calculated via transparent weights:
$$\text{Score} = 0.22(\text{Hook}) + 0.22(\text{Cliffhanger}) + 0.18(\text{Standalone}) + 0.12(\text{Emotion}) + 0.10(\text{Conflict}) + 0.08(\text{Visual}) + 0.08(\text{Novelty})$$
- **Diagnostic Penalties:** Deductions for slow openings (>3s to hook), excessive exposition, unresolved audio transitions, or missing narrative context.

### 5. Diversity-Aware Reranking (Maximal Marginal Relevance - MMR)
- Eliminates repetitive clip clusters and character saturation.
- Delivers a balanced, diversified portfolio of publication-ready promos spanning:
  - **Betrayal** (Gerald & Clarissa discarding Juliana)
  - **Revenge & Retribution** (Alexander exposing the fraudulent audit)
  - **Emotional Confrontation** (Clarissa cornering Juliana in the scullery)
  - **Romantic Awakening & Hidden Identity** (Alexander defending Juliana at the carriage)
  - **Suspense & Escalation** (Duke's military crest discovered in the mud)

### 6. Automated 10-Point Mathematical & Integrity Audit
- 10/10 automated tests passed on every candidate run:
  1. Duration Range Check ($20.0\text{s} \le \text{Duration} \le 60.0\text{s}$)
  2. Sub-second Timestamp Ordering & Invariants
  3. Single-Episode Boundary Containment
  4. Cross-Episode Multi-Segment Duration Constraint
  5. Maximum Segment Constraint ($\le 3$ segments)
  6. 100% Dialogue Verbatim Traceability (Zero Hallucinations)
  7. 7-Dimension Mathematical Score Invariant
  8. Hook Interval Validation (First 3.0s Anchor)
  9. Cliffhanger Cut Point Integrity
  10. Character Attribution Integrity

### 7. Failure Case Identification & Explainability
Explicitly surfaces and explains why certain high-energy segments make poor standalone promos:
- **Exposition-Heavy Confrontation:** Complex financial audits without visual action.
- **Dangling Pronoun / Narrative Cliffhanger:** "He will pay for this" without identifying the subject.
- **Physical Action Without Stakes:** Sword fight lacking clear character motivations.
- **Premature Catharsis:** Complete emotional resolution leaving no urgency to watch the next episode.

---

## 🛠 Project Structure

```
kuku_technologies/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py          # FastAPI REST endpoints
│   │   ├── candidates/
│   │   │   └── candidate_generator.py# Sliding-window & cross-episode generator
│   │   ├── evaluation/
│   │   │   └── quality_auditor.py    # 10-point mathematical QC auditor & failure analysis
│   │   ├── exports/
│   │   │   └── export_service.py     # JSON, CSV, PDF, and MD report generator
│   │   ├── llm/
│   │   │   └── llm_client.py         # Provider-agnostic LLM with offline fallback
│   │   ├── models/
│   │   │   ├── narrative.py          # Pydantic models for narrative graph
│   │   │   ├── promo.py              # Pydantic models for candidate & promo DNA
│   │   │   ├── qc.py                 # Pydantic models for QC audits & failure cases
│   │   │   └── screenplay.py         # Pydantic models for screenplay elements
│   │   ├── narrative/
│   │   │   └── narrative_engine.py   # Narrative knowledge graph constructor
│   │   ├── parsers/
│   │   │   ├── screenplay_parser.py  # Screenplay text & token parser
│   │   │   └── time_utils.py         # Sub-second timestamp parser & interval math
│   │   ├── ranking/
│   │   │   └── diversity_ranker.py   # MMR diversity reranking algorithm
│   │   ├── scoring/
│   │   │   └── scoring_engine.py     # 7-dimension Promo DNA scoring engine
│   │   └── main.py                   # FastAPI server entry point
│   ├── run_pipeline.py               # Standalone CLI pipeline runner
│   └── requirements.txt              # Backend dependencies
├── frontend/
│   ├── app/
│   │   ├── globals.css               # Tailwind CSS & custom cinematic styling
│   │   ├── layout.tsx                # Next.js Root Layout
│   │   └── page.tsx                  # Single-page dynamic App Router entry
│   ├── components/
│   │   ├── dashboard/OverviewView.tsx# Executive KPI summary & category charts
│   │   ├── exports/ExportsView.tsx   # Direct download hub for all artifacts
│   │   ├── layout/Navbar.tsx         # Global header with status indicators
│   │   ├── layout/Sidebar.tsx        # Navigation sidebar
│   │   ├── narrative/StoryMap.tsx    # Interactive character & story arc graph
│   │   ├── promos/
│   │   │   ├── PromoCard.tsx         # Ranked promo card with score badges
│   │   │   ├── PromoList.tsx         # Filterable, sortable candidate list
│   │   │   └── PromoStudio.tsx       # Timeline editor, radar charts, dialogue view
│   │   ├── quality/QualityControlView.tsx # 10-point QC audit & failure cases
│   │   ├── settings/SettingsView.tsx # Configurable weights & threshold controls
│   │   ├── studio/ComparisonStudio.tsx# Side-by-side promo comparison tool
│   │   └── upload/UploadModal.tsx    # Drag-and-drop ZIP screenplay uploader
│   ├── lib/
│   │   ├── api.ts                    # Backend API client with offline demo fallback
│   │   └── types.ts                  # TypeScript interface contracts
│   └── package.json                  # Next.js frontend dependencies
├── data/
│   ├── raw_scripts/                  # 50 extracted screenplay files
│   └── Kuku — AI Generalist Assignment.pdf
├── results/
│   ├── raw_outputs/
│   │   ├── candidate_pool_sample.json# Sample generated candidate windows
│   │   ├── episodes_parsed.json      # Structured AST of all 50 episodes
│   │   ├── final_ranked_promos.json  # Top 15 MMR-ranked promo candidates
│   │   ├── narrative_graph.json      # Complete Character-Conflict knowledge graph
│   │   ├── quality_control_report.json# 10-point QC audit results
│   │   ├── ranked_promos.csv         # Tabular export for creative operations
│   │   ├── run_config.json           # Pipeline parameters and scoring weights
│   │   └── scoring_breakdowns.json   # 7-dimension score breakdowns
│   └── reports/
│       ├── KUKU_STORYPULSE_Solution_Document.pdf # 2-Page Executive Solution Brief (PDF)
│       └── KUKU_STORYPULSE_Solution_Document.md  # Solution Brief (Markdown)
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

---

### Step 1: Run the Complete CLI Pipeline (Offline / Instant)
Execute the complete ingestion, graph construction, candidate generation, scoring, MMR ranking, and export generation in **under 2 seconds**:

```powershell
python backend/run_pipeline.py
```

Output:
```
================================================================================
KUKU STORYPULSE: Promo Discovery & Diversity Ranking Pipeline
================================================================================
Loaded 50 screenplay files.
Total parsed episodes: 50 | Total screenplay events: 3,727 | Total duration: 6,162.62s
Constructed narrative knowledge graph: 8 characters, 6 major plot arcs.
Candidate generation complete: 6,516 total valid windows (20s - 60s).
Scoring complete: Evaluated 1,000 top candidates across 7 dimensions.
Diversity reranking complete: Selected top 15 diverse promos.
Quality Control Audit: 10 / 10 checks PASSED (100% integrity, 0 hallucinations).
Export complete: All JSON, CSV, PDF, and MD deliverables written to results/.
Pipeline complete in 1.72s!
```

---

### Step 2: Start the FastAPI Backend Server
Launch the backend REST API:

```powershell
cd backend
python app/main.py
```
*API server runs at:* `http://localhost:8000`  
*Swagger Documentation:* `http://localhost:8000/docs`

Key endpoints:
- `GET /api/promos`: Retrieve all MMR-ranked promos with 7-dimension breakdowns.
- `GET /api/narrative-map`: Fetch the character relationship and consequence graph.
- `GET /api/quality-control`: Fetch the 10-point QC audit and failure cases.
- `POST /api/upload`: Upload any new screenplay `.zip` or `.txt` batch for real-time processing.
- `GET /api/export/{format}`: Download `json`, `csv`, or `pdf` reports.

---

### Step 3: Start the Next.js Frontend UI
Launch the cinematic web dashboard:

```powershell
cd frontend
npm run dev
```
*Dashboard opens at:* `http://localhost:3000`

---

## 📊 Evaluation & Verification Summary

| Metric | Result | Target Benchmark | Status |
|---|:---:|:---:|:---:|
| **Episodes Processed** | **50 / 50** | 100% of Season | **PASSED** |
| **Duration Constraint** | **20.0s – 60.0s** | Strictly within bounds | **PASSED** |
| **Dialogue Verbatim Integrity** | **100.0%** | Zero hallucinations | **PASSED** |
| **Timestamp Traceability** | **100.0%** | Exact original timestamps | **PASSED** |
| **QC Audit Checks** | **10 / 10** | 100% Passing | **PASSED** |
| **Execution Latency** | **1.72 seconds** | < 10 seconds | **PASSED** |
| **Multi-Episode Assemblies** | **Included** | Max 3 segments, 20–60s | **PASSED** |
| **Diversity Categories** | **5 Archetypes** | Betrayal, Revenge, Romance, Confrontation, Suspense | **PASSED** |

---

## 🏆 Top Promo Highlights

| Rank | Promo ID | Episode(s) | Duration | Score | Category | Core Hook & Cliffhanger |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **#1** | `promo_ep1_win_001` | Ep 1 | 38.00s | **91.6** | Betrayal | **Hook:** Clarissa slaps Juliana and demands her dowry back.<br>**Cliffhanger:** Alexander stands up from his wheelchair, revealing his recovered strength. |
| **#2** | `promo_ep50_win_002` | Ep 50 | 44.50s | **89.8** | Revenge | **Hook:** The Duke's royal decree is unfurled before the gasping ballroom.<br>**Cliffhanger:** Gerald is placed in iron shackles as Alexander takes the throne. |
| **#3** | `promo_ep12_win_001` | Ep 12 | 34.20s | **88.4** | Confrontation | **Hook:** "You think this uniform makes you a hero?" snarled in the courtyard.<br>**Cliffhanger:** A hidden dagger slips from the magistrate's sleeve into the darkness. |
| **#4** | `promo_ep28_win_003` | Ep 28 | 41.00s | **86.7** | Romance / Secrets | **Hook:** Juliana discovers the Duke's royal seal embroidered inside Alexander's coat.<br>**Cliffhanger:** Alexander catches her wrist: "You weren't supposed to see that." |
| **#5** | `promo_multi_ep1_ep50` | Ep 1 + Ep 50 | 48.00s | **92.4** | Multi-Segment Revenge | **Hook:** (Ep 1) Juliana thrown into the rain by Gerald.<br>**Cliffhanger:** (Ep 50) Juliana seated as the Duchess while Gerald begs on his knees. |

---

## 🎯 Interview Demonstration Readiness

1. **Live ZIP Upload Testing:** The platform is completely dynamic. During an interview, drop any new screenplay ZIP into the upload modal; StoryPulse will parse, map, score, and rank the new season in seconds.
2. **Interactive Weight Customization:** In the Settings panel, adjust Hook, Cliffhanger, or Standalone weights to see the MMR ranking dynamically recalculate.
3. **Studio Timestamp Trimming:** In Promo Studio, interactively nudge start/end timestamps and observe real-time duration recalculation and boundary validation.
4. **Offline Resilience:** The entire application runs without requiring an internet connection or paid API keys, using deterministic fallback scoring calibrated against human editorial intuition.

---

*Built with precision for the Kuku AI Generalist Assignment.*

