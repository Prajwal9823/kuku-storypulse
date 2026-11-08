"""
Timestamp utilities for screenplay parsing and promo boundary calculations.
Supports MM:SS.xx format with sub-second precision.
"""

import re
from typing import Optional, Tuple

TIMESTAMP_PATTERN = re.compile(r'\(?(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\)?')


def parse_timestamp(ts_str: str) -> float:
    """
    Parse a timestamp string in MM:SS.xx or (MM:SS.xx) format into seconds as float.
    Examples:
        '00:11.30' -> 11.30
        '(01:23.45)' -> 83.45
        '02:18.00' -> 138.00
    """
    if not ts_str:
        return 0.0
    ts_str = ts_str.strip()
    match = TIMESTAMP_PATTERN.search(ts_str)
    if not match:
        raise ValueError(f"Invalid timestamp format: '{ts_str}'")

    minutes = int(match.group(1))
    seconds = int(match.group(2))
    subseconds = float("0." + (match.group(3) or "0"))

    return round(minutes * 60 + seconds + subseconds, 3)


def format_timestamp(seconds: float) -> str:
    """
    Format seconds (float) into MM:SS.xx string format.
    Example:
        83.45 -> '01:23.45'
    """
    if seconds < 0:
        seconds = 0.0
    minutes = int(seconds // 60)
    rem_seconds = seconds % 60
    return f"{minutes:02d}:{rem_seconds:05.2f}"


def calculate_duration(start_sec: float, end_sec: float) -> float:
    """Calculate duration between two timestamps in seconds."""
    return round(max(0.0, end_sec - start_sec), 3)


def intervals_overlap(
    start1: float, end1: float, start2: float, end2: float
) -> Tuple[bool, float]:
    """
    Check if two time intervals overlap.
    Returns (does_overlap, overlap_duration_seconds).
    """
    overlap_start = max(start1, start2)
    overlap_end = min(end1, end2)
    if overlap_end > overlap_start:
        return True, round(overlap_end - overlap_start, 3)
    return False, 0.0


def interval_jaccard(
    start1: float, end1: float, start2: float, end2: float
) -> float:
    """
    Calculate Jaccard temporal overlap between two intervals:
    Overlap / Union.
    """
    overlap_start = max(start1, start2)
    overlap_end = min(end1, end2)
    overlap_len = max(0.0, overlap_end - overlap_start)
    if overlap_len <= 0.0:
        return 0.0
    union_len = (end1 - start1) + (end2 - start2) - overlap_len
    if union_len <= 0.0:
        return 0.0
    return round(overlap_len / union_len, 4)

