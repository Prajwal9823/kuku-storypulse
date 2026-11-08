"""
Robust Screenplay Parser.
Parses microdrama screenplay text files with microsecond timestamp fidelity,
extracting scenes, dialogue, character delivery, actions, camera moves, and sound fx.
"""

import os
import re
import zipfile
import glob
from typing import List, Dict, Optional, Tuple
from app.parsers.time_utils import parse_timestamp, format_timestamp
from app.models.screenplay import (
    ScreenplayEvent,
    EventType,
    Scene,
    Episode,
    Show,
)

EPISODE_HEADER_RE = re.compile(r'EPISODE NUMBER:\s*Episode\s*(\d+)', re.IGNORECASE)
LOGLINE_RE = re.compile(r'EPISODE LOGLINE:\s*(.*?)(?=\nCONTINUITY NOTES:|\n---|\Z)', re.DOTALL | re.IGNORECASE)
CONTINUITY_RE = re.compile(r'CONTINUITY NOTES:\s*(.*?)(?=\n--- SCRIPT START ---|\nSCENE|\Z)', re.DOTALL | re.IGNORECASE)

SCENE_HEADER_RE = re.compile(
    r'SCENE\s+(\d+)\s*\n'
    r'Scene heading:\s*(.*?)\s*\n'
    r'Scene start:\s*([\d:\.]+)\s*\n'
    r'Scene end:\s*([\d:\.]+)',
    re.IGNORECASE
)

EVENT_BLOCK_RE = re.compile(
    r'\*\*([^*]+)\*\*\s*\n'
    r'Start:\s*\(([\d:\.]+)\)\s*\|\s*End:\s*\(([\d:\.]+)\)\s*\n'
    r'(.*?)(?=\n\*\*|\nSCENE\s+\d+|\n--- SCRIPT END ---|\Z)',
    re.DOTALL
)


def parse_event_tag(tag: str) -> Tuple[EventType, Optional[str], Optional[str]]:
    """
    Parse a tag like 'CAMERA:', 'ACTION:', 'SOUND FX:',
    or 'MATRIARCH (Cold, Commanding):' or 'LADY JULIANA:'
    Returns (event_type, speaker, delivery).
    """
    tag = tag.strip().rstrip(':')
    upper_tag = tag.upper()

    if upper_tag.startswith("CAMERA"):
        return EventType.CAMERA, None, None
    elif upper_tag.startswith("ACTION"):
        return EventType.ACTION, None, None
    elif upper_tag.startswith("SOUND FX") or upper_tag.startswith("SOUND"):
        return EventType.SOUND_FX, None, None
    else:
        # Dialogue
        speaker = tag
        delivery = None
        if "(" in tag and ")" in tag:
            parts = tag.split("(", 1)
            speaker = parts[0].strip()
            delivery = parts[1].split(")", 1)[0].strip()
        return EventType.DIALOGUE, speaker, delivery


def parse_episode_text(text: str, filename: str = "") -> Episode:
    """Parse raw screenplay text of a single episode."""
    ep_match = EPISODE_HEADER_RE.search(text)
    ep_num = int(ep_match.group(1)) if ep_match else 1

    logline_match = LOGLINE_RE.search(text)
    logline = logline_match.group(1).strip() if logline_match else ""

    continuity_match = CONTINUITY_RE.search(text)
    continuity = continuity_match.group(1).strip() if continuity_match else ""

    # Split into scenes
    scene_matches = list(SCENE_HEADER_RE.finditer(text))
    scenes: List[Scene] = []
    all_events: List[ScreenplayEvent] = []

    for i, sm in enumerate(scene_matches):
        s_num = int(sm.group(1))
        heading = sm.group(2).strip()
        s_start_str = sm.group(3).strip()
        s_end_str = sm.group(4).strip()
        s_start_sec = parse_timestamp(s_start_str)
        s_end_sec = parse_timestamp(s_end_str)

        # Content of scene extends to the start of the next scene or end of script
        start_idx = sm.end()
        end_idx = scene_matches[i + 1].start() if i + 1 < len(scene_matches) else len(text)
        scene_body = text[start_idx:end_idx]

        scene_events: List[ScreenplayEvent] = []
        event_matches = list(EVENT_BLOCK_RE.finditer(scene_body))

        for j, em in enumerate(event_matches):
            raw_tag = em.group(1).strip()
            ev_start_str = em.group(2).strip()
            ev_end_str = em.group(3).strip()
            ev_content = em.group(4).strip()

            ev_start_sec = parse_timestamp(ev_start_str)
            ev_end_sec = parse_timestamp(ev_end_str)
            event_type, speaker, delivery = parse_event_tag(raw_tag)

            event_id = f"ep{ep_num:03d}_sc{s_num:02d}_ev{j+1:03d}"

            event = ScreenplayEvent(
                id=event_id,
                episode_number=ep_num,
                scene_number=s_num,
                event_type=event_type,
                start_time=ev_start_sec,
                end_time=ev_end_sec,
                start_str=ev_start_str,
                end_str=ev_end_str,
                speaker=speaker,
                delivery=delivery,
                content=ev_content,
                raw_header=raw_tag,
            )
            scene_events.append(event)
            all_events.append(event)

        scenes.append(
            Scene(
                scene_number=s_num,
                heading=heading,
                start_time=s_start_sec,
                end_time=s_end_sec,
                start_str=s_start_str,
                end_str=s_end_str,
                events=scene_events,
            )
        )

    # Calculate overall episode duration
    max_ev_end = max([ev.end_time for ev in all_events], default=0.0)
    max_sc_end = max([sc.end_time for sc in scenes], default=0.0)
    total_duration = max(max_ev_end, max_sc_end)

    return Episode(
        episode_number=ep_num,
        episode_id=f"EP_{ep_num:03d}",
        title=f"Episode {ep_num}",
        logline=logline,
        continuity_notes=continuity,
        total_duration=round(total_duration, 2),
        scenes=scenes,
        all_events=all_events,
    )


def parse_show_directory(dir_path: str, show_title: Optional[str] = None) -> Show:
    """Parse all screenplay files in a directory into a Show instance."""
    txt_files = sorted(glob.glob(os.path.join(dir_path, "**", "*.txt"), recursive=True))
    if not txt_files:
        raise FileNotFoundError(f"No .txt screenplay files found in {dir_path}")

    episodes: List[Episode] = []
    for fpath in txt_files:
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()
        ep = parse_episode_text(text, filename=os.path.basename(fpath))
        episodes.append(ep)

    # Sort episodes by episode number
    episodes.sort(key=lambda x: x.episode_number)

    if not show_title:
        # Determine title from parent directory or first file
        parent_name = os.path.basename(os.path.normpath(dir_path))
        show_title = parent_name if parent_name and parent_name != "raw_scripts" else "I Married a Broken Soldier. He was a Duke"

    total_runtime = sum(ep.total_duration for ep in episodes)

    return Show(
        show_id=re.sub(r'[^a-zA-Z0-9_]', '_', show_title.lower()).strip('_'),
        title=show_title,
        total_episodes=len(episodes),
        total_runtime_seconds=round(total_runtime, 2),
        episodes=episodes,
    )


def parse_show_zip(zip_path: str, extract_dir: str, show_title: Optional[str] = None) -> Show:
    """Extract and parse a ZIP file containing screenplay txt files."""
    os.makedirs(extract_dir, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_dir)
    return parse_show_directory(extract_dir, show_title=show_title)

