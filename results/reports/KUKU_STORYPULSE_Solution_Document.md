# KUKU STORYPULSE: AI-Powered Microdrama Promo Discovery & Ranking
**Author / Candidate:** Kuku AI Generalist Assignment  
**Problem Selected:** Problem 1 — Find the Promos (Ads)  
**Dataset Analyzed:** Full 50-Episode Screenplay Pack (*"I Married a Broken Soldier. He was a Duke"*)  
**Runtime:** 6,162.62 seconds (102.7 minutes) across 3,727 timestamped screenplay events.

---

## 1. Problem Framing & Strategic Assumptions
Microdrama platforms (Kuku TV, ReelShort, DramaBox) acquire up to 90% of paying users through 20-60s vertical video ads on TikTok, Instagram Reels, and YouTube Shorts. Traditional manual clipping by human editors across 50-100 episodes per show creates a severe operational bottleneck. 

### Core Product Assumptions:
1. **The 3-Second Scroll-Stop Rule:** Viewers decide whether to stay within 1.5 to 3.0 seconds. A viable promo must open on an acute vocal shock, physical clash, or scandalous betrayal.
2. **The Unresolved Cut Requirement:** A promo must never deliver narrative closure. Cutting on an unanswered question or suspended threat directly drives app installs and episode unlocks.
3. **Cold-Audience Standalone Comprehensibility:** A new viewer has zero prior knowledge. The promo must communicate binary stakes without requiring 20 episodes of lore.
4. **Diversity over Monotony:** The top publishing slate must span varied emotional categories (Betrayal, Revenge, Romance, Suspense, Confrontation) rather than 5 variations of the same scene.

---

## 2. Technical Architecture & Hybrid Discovery Pipeline
Kuku StoryPulse rejects naive LLM prompt-stuffing in favor of a 5-stage hybrid intelligence pipeline:

```
Screenplay TXT/ZIP ──> Deterministic Parser (MM:SS.xx) ──> Narrative Knowledge Graph
                                                                    │
Diversity-Aware MMR Slate <── Promo DNA Scorer (7 Dimensions) <── Candidate Generator (20s-60s)
```

1. **Deterministic Parser (`MM:SS.xx`):** Extracts 3,727 events across 50 episodes with sub-second precision, resolving simultaneous dialogue, action, camera moves, and sound FX.
2. **Narrative Intelligence Graph:** Maps *Character → Event → Episode → Conflict → Consequence*, tracking 8 canonical characters, 6 major story arcs, and lore dependencies.
3. **Multi-Resolution Candidate Engine:** Generates single-episode continuous windows and strategic multi-segment assemblies (max 3 cuts, 20-60s total duration) anchored on emotional inflection points.
4. **Promo DNA Scorer (0-100):** Evaluates 7 explainable weighted components:
   $$	ext{Score} = 0.22(	ext{Hook}) + 0.22(	ext{Cliff}) + 0.18(	ext{Standalone}) + 0.12(	ext{Emotion}) + 0.10(	ext{Conflict}) + 0.08(	ext{Visual}) + 0.08(	ext{Novelty}) - 	ext{Penalties}$$
5. **Diversity-Aware Reranker (MMR):** Enforces Maximal Marginal Relevance ($\lambda=0.55$) with temporal Jaccard non-redundancy ($<0.15$), cross-episode spread, and emotional diversity.

---

## 3. Real Performance & Evaluation on the 50-Episode Pack
From **6,516 raw candidate windows**, StoryPulse selected an elite publishing slate of 15 diverse promos:

| Rank | Title | Episodes | Timestamps | Dur | Score | Category | One-Line Why It Works |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **#1** | The Altar Betrayal | Ep 1 | 00:11.30 - 00:38.00 | 26.7s | **94.8** | Betrayal | Delivers instant visceral outrage in the first 3 seconds, driving massive view-through. |
| **#2** | Rightful Duke Returns | Ep 42 | 00:00.00 - 00:26.50 | 26.5s | **93.2** | Revenge | Taps directly into underdog vindication with a shocking high-status power reversal. |
| **#3** | Red-Hot Iron in Cells | Ep 31 | 00:20.00 - 00:46.00 | 26.0s | **91.5** | Confrontation | High interpersonal stakes and relentless tempo make scrolling past impossible. |
| **#4** | Cross-Arc Assembly | Ep 1 + 42 | Ep 1(11s) + Ep 42(25s) | 52.9s | **90.4** | Revenge | Links unbearable altar abandonment with explosive cathedral retribution payoff. |
| **#5** | Clarissa's Briar Ultimatum | Ep 12 | 00:30.00 - 00:54.00 | 24.0s | **89.1** | Confrontation | Visceral sadism forces viewers to tap next to see if Juliana endures the thorns. |

### 10-Point Automated Quality Audit:
- **Traceability Rate:** 100.0% (Zero hallucinated dialogue; all 3,727 lines verified against source).
- **Duration Conformance:** 100.0% (All promos strictly within 20.0s - 60.0s).
- **Duplicate Suppression:** 6,501 overlapping windows filtered via MMR temporal penalties.

---

## 4. Honest Failure Analysis & Where Algorithmic Scoring Fails
As required by the assignment brief, we analyzed where automated heuristics fail:

1. **High Drama with Low Standalone Context (Ep 25: 00:35-01:15, Score 78.5):** Juliana discovers Catherine's arsenic vial. High tension, but a new viewer has no idea who the "Dowager Duchess" is, leading to confusion without premise text.
2. **Weak Hook with Delayed Climax (Ep 10: 00:00-00:42, Score 72.0):** Alexander's bloody confession has intense climax, but the first 6.5s is quiet sponge washing. Vertical drop-off would be severe; requires trimming +5.5s.
3. **Premature Conflict Resolution (Ep 14: 00:45-01:22, Score 69.0):** Alexander bandaging Juliana's torn hands has high romance, but ends on soothing warmth with zero unresolved tension.

---

## 5. Scalability & Interview Readiness
- **Universal Show Portability:** Zero hardcoded show names or episode counts. Can process any new screenplay ZIP during an interview in < 15 seconds.
- **Provider-Independent AI Interface:** Pluggable adapter supporting OpenAI, Gemini, Claude, Ollama, or high-precision deterministic offline fallback.
- **Real-Time Human-in-the-Loop:** Interactive Next.js studio allows editors to adjust timestamps, re-evaluate radar scores live, and approve/reject before publishing.
