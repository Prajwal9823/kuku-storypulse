"""
Screenplay data models using Pydantic.
Preserves exact original text, timestamps, character delivery, and simultaneous events.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class EventType(str, Enum):
    DIALOGUE = "dialogue"
    ACTION = "action"
    CAMERA = "camera"
    SOUND_FX = "sound_fx"


class ScreenplayEvent(BaseModel):
    id: str
    episode_number: int
    scene_number: int
    event_type: EventType
    start_time: float
    end_time: float
    start_str: str
    end_str: str
    speaker: Optional[str] = None
    delivery: Optional[str] = None  # e.g., "Cold, Commanding", "Confused, Breathless"
    content: str  # Original dialogue or visual/audio description
    raw_header: str


class Scene(BaseModel):
    scene_number: int
    heading: str  # e.g. "INT. CATHEDRAL – DAY"
    start_time: float
    end_time: float
    start_str: str
    end_str: str
    events: List[ScreenplayEvent] = Field(default_factory=list)


class Episode(BaseModel):
    episode_number: int
    episode_id: str
    title: str
    logline: str
    continuity_notes: str
    total_duration: float
    scenes: List[Scene] = Field(default_factory=list)
    all_events: List[ScreenplayEvent] = Field(default_factory=list)


class Show(BaseModel):
    show_id: str
    title: str
    total_episodes: int
    total_runtime_seconds: float
    episodes: List[Episode] = Field(default_factory=list)

