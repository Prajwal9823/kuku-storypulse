"""
Narrative intelligence models for character graph and story arcs.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class Character(BaseModel):
    id: str
    name: str
    canonical_name: str
    role: str  # "Protagonist", "Antagonist", "Ally", "Romantic Lead", "Catalyst"
    aliases: List[str] = Field(default_factory=list)
    description: str
    key_traits: List[str] = Field(default_factory=list)
    total_lines: int = 0
    first_episode: int = 1


class Relationship(BaseModel):
    source: str
    target: str
    relation_type: str  # "Betrayal", "Romance", "Spousal", "Rivalry", "Deception", "Loyalty", "Subjugation"
    description: str
    dynamics: str  # High tension, covert ally, bitter resentment, tender protection


class StoryArc(BaseModel):
    id: str
    title: str
    episode_start: int
    episode_end: int
    summary: str
    core_conflict: str
    key_revelations: List[str] = Field(default_factory=list)
    emotional_tone: str
    prominence_weight: float = 1.0


class NarrativeNode(BaseModel):
    id: str
    label: str
    node_type: str  # "character", "event", "arc", "conflict", "reveal"
    metadata: Dict[str, str] = Field(default_factory=dict)


class NarrativeEdge(BaseModel):
    source: str
    target: str
    relation: str
    weight: float = 1.0
    episode: Optional[int] = None


class NarrativeGraph(BaseModel):
    nodes: List[NarrativeNode] = Field(default_factory=list)
    edges: List[NarrativeEdge] = Field(default_factory=list)
    arcs: List[StoryArc] = Field(default_factory=list)
    characters: List[Character] = Field(default_factory=list)
    relationships: List[Relationship] = Field(default_factory=list)

