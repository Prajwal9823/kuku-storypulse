"""
Quality control, validation, and failure analysis models.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ValidationCheckResult(BaseModel):
    check_name: str
    passed: bool
    severity: str  # "critical", "warning", "info"
    details: str
    affected_promo_ids: List[str] = Field(default_factory=list)


class PromoFailureCase(BaseModel):
    id: str
    title: str
    failure_mode: str  # e.g., "High Drama with Low Standalone Context", "Weak Hook with Delayed Climax", "Premature Resolution", "Jarring Cut"
    episode: int
    timestamps: str
    initial_score: float
    true_editorial_rating: str  # "REJECTED", "BORDERLINE"
    why_it_failed: str
    how_system_identified_it: str
    remediation_suggestion: str


class QualityControlReport(BaseModel):
    total_candidates_generated: int
    total_promos_ranked: int
    duration_valid_count: int
    duration_violation_count: int
    timestamp_valid_count: int
    timestamp_violation_count: int
    zero_hallucination_verified: bool
    traceability_rate_percent: float = 100.0
    duplicate_suppression_count: int
    checks: List[ValidationCheckResult] = Field(default_factory=list)
    failure_cases: List[PromoFailureCase] = Field(default_factory=list)

