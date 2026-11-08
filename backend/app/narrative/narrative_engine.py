"""
Narrative Intelligence Engine for microdrama story understanding.
Constructs canonical character models, relationship graphs, story arcs,
and event consequence chains (Character -> Event -> Episode -> Conflict -> Consequence).
"""

from typing import List, Dict, Set, Optional, Tuple
from app.models.screenplay import Show, Episode, ScreenplayEvent
from app.models.narrative import (
    Character,
    Relationship,
    StoryArc,
    NarrativeNode,
    NarrativeEdge,
    NarrativeGraph,
)

# Canonical character alias mappings
CHARACTER_ALIASES: Dict[str, str] = {
    "JULIANA": "Juliana",
    "LADY JULIANA": "Juliana",
    "ALEXANDER": "Alexander",
    "MYSTERIOUS BEARDED MAN": "Alexander",
    "THE BEARDED STRANGER": "Alexander",
    "THE BROKEN SOLDIER": "Alexander",
    "DUKE OF ASHBURN": "Alexander",
    "DUKE OF ASHBURTON": "Alexander",
    "GERALD": "Gerald",
    "THE FORMER GROOM": "Gerald",
    "GERALD HARRINGTON": "Gerald",
    "CLARISSA": "Clarissa",
    "LADY IN GOLD GOWN": "Clarissa",
    "CATHERINE": "Catherine",
    "LADY CATHERINE": "Catherine",
    "RUPERT": "Rupert",
    "DOWAGER DUCHESS": "Dowager Duchess",
    "DUCHESS": "Dowager Duchess",
    "ALEXANDER'S MOTHER": "Dowager Duchess",
    "FATHER THOMAS": "Father Thomas",
    "PRUDENCE": "Prudence",
    "AGNES": "Agnes",
    "MATRIARCH": "Lady Ashcroft",
    "NOBLE MATRIARCH": "Lady Ashcroft",
    "LORD ASHCROFT": "Lord Ashcroft",
    "HIGH PRIEST": "High Priest",
    "JUDGE": "The Magistrate",
}

STORY_ARCS_DATA: List[Dict] = [
    {
        "id": "arc_1",
        "title": "The Altar Betrayal & The Outcast's Vow",
        "episode_start": 1,
        "episode_end": 6,
        "summary": "Lady Juliana arrives in her late mother's bridal gown only to be abandoned at the altar by Gerald for her sister Clarissa. Stripped of inheritance, she accepts a solemn marriage proposal from a mysterious scarred soldier, Alexander, embracing honorable exile over cruel nobility.",
        "core_conflict": "Social abandonment & familial betrayal vs quiet dignity",
        "key_revelations": [
            "Gerald betrays Juliana for Clarissa with full family blessing",
            "A scarred, decorated veteran intervenes and marries Juliana",
            "Juliana is disowned with only her mother's medicinal ledger"
        ],
        "emotional_tone": "Humiliation, Defiance, Hopeful Resilience",
        "prominence_weight": 1.2
    },
    {
        "id": "arc_2",
        "title": "Cottage Trials & The Blackthorn Ordeal",
        "episode_start": 7,
        "episode_end": 17,
        "summary": "Gerald and Clarissa persecute the newlyweds at their woodland cottage. Clarissa gives Juliana a sadistic ultimatum: retrieve a signet ring barehanded from blackthorn briars or watch Alexander hang. Juliana endures the lacerations, cementing Alexander's fierce protective loyalty.",
        "core_conflict": "Cruel aristocratic harassment vs sacrificial marital devotion",
        "key_revelations": [
            "Juliana possesses rare medicinal healing expertise from her late mother",
            "Clarissa's blackthorn briar torture fails to break Juliana's spirit",
            "Hired thugs attacking Juliana's garden confess Gerald is the mastermind"
        ],
        "emotional_tone": "Cruelty, Sacrificial Love, Protective Vengeance",
        "prominence_weight": 1.1
    },
    {
        "id": "arc_3",
        "title": "Arson, Manor Infiltration & The Poisoned Duchess",
        "episode_start": 18,
        "episode_end": 28,
        "summary": "After their cottage is burned to the ground by arsonists, Alexander discovers his usurpers have seized his ducal seat and imprisoned his mother. Juliana disguises herself as a scullery maid to infiltrate Ashbury Manor, discovering Lady Catherine is systematically poisoning the Dowager Duchess with arsenic.",
        "core_conflict": "Usurpation & covert murder vs daring espionage and healing",
        "key_revelations": [
            "Alexander is secretly the presumed-dead Duke of Ashburn",
            "Rupert and Catherine have usurped the ducal title and poisoned Alexander's mother",
            "Juliana risks her life to hide an herbal antidote in the forbidden West Wing"
        ],
        "emotional_tone": "Danger, Suspense, Uncovering High Treason",
        "prominence_weight": 1.3
    },
    {
        "id": "arc_4",
        "title": "Witchcraft Frame-up & The Damp Cell Ordeal",
        "episode_start": 29,
        "episode_end": 38,
        "summary": "Catherine frames Juliana for witchcraft to cover up the arsenic poisoning. Juliana is chained in wet dungeon cells and subjected to psychological and physical torment with a red-hot iron by Catherine, while Alexander's elderly mother escapes through a blizzard to reunite with Alexander.",
        "core_conflict": "Ruthless tyranny & judicial fabrication vs unyielding moral courage",
        "key_revelations": [
            "Maid coerced into false witchcraft testimony against Juliana",
            "Juliana refuses to break under Catherine's torture in the damp cells",
            "Alexander's mother escapes through blizzard, revealing Juliana's impending execution"
        ],
        "emotional_tone": "Dread, Sadism, Indomitable Will, Brewing Retribution",
        "prominence_weight": 1.2
    },
    {
        "id": "arc_5",
        "title": "Cathedral Shattered: The Duke's Retribution",
        "episode_start": 39,
        "episode_end": 45,
        "summary": "As high society gathers for Rupert and Catherine's lavish wedding and Juliana is paraded in chains for execution, an explosion shatters the cathedral gates. Alexander emerges in full ducal regalia, overpowers Rupert, wins the guards' allegiance, and crowns Juliana Duchess of Ashburn.",
        "core_conflict": "Triumphant justice and rightful return vs arrogant usurpers",
        "key_revelations": [
            "Alexander storms the cathedral gates in full ducal regalia",
            "Royal guards turn and salute Alexander as the true Duke of Ashburn",
            "Crown intelligence exposes Rupert's treason; Catherine is rejected"
        ],
        "emotional_tone": "Triumph, Catharsis, Supreme Vindication, Romance",
        "prominence_weight": 1.4
    },
    {
        "id": "arc_6",
        "title": "The Ecclesiastical Challenge & Catherine's Descent",
        "episode_start": 46,
        "episode_end": 50,
        "summary": "The High Priest challenges Alexander and Juliana's marriage license, granting a ten-day ecclesiastical reprieve. Catherine, stripped of rank and reduced to a scullery maid, conspires with corrupt Father Thomas in the manor's abandoned wing, where their treasonous affair is witnessed by Agnes.",
        "core_conflict": "Institutional corruption & desperate subversion vs rightful sovereignty",
        "key_revelations": [
            "High Priest suspends ducal marriage pending ecclesiastical council",
            "Catherine reduced to servant status, plots revenge with Father Thomas",
            "Agnes discovers Catherine and Father Thomas in scandalous treasonous intimacy"
        ],
        "emotional_tone": "Machiavellian Intrigue, Scandal, Forbidden Secrets, Suspense",
        "prominence_weight": 1.1
    }
]


def resolve_canonical_character(speaker_name: Optional[str]) -> Optional[str]:
    """Map raw speaker string to canonical character name."""
    if not speaker_name:
        return None
    cleaned = speaker_name.strip().upper()
    return CHARACTER_ALIASES.get(cleaned, speaker_name.title())


class NarrativeEngine:
    """
    Constructs and queries the Narrative Knowledge Graph.
    Connects Characters, Events, Arcs, Conflicts, and Consequences.
    """

    def __init__(self, show: Show):
        self.show = show
        self.graph = NarrativeGraph()
        self._build_narrative_layer()

    def _build_narrative_layer(self):
        """Construct full narrative models, characters, relationships, and graph."""
        # 1. Build Story Arcs
        self.graph.arcs = [StoryArc(**arc) for arc in STORY_ARCS_DATA]

        # 2. Count character lines & find first appearances
        char_stats: Dict[str, Dict] = {}
        for ep in self.show.episodes:
            for ev in ep.all_events:
                if ev.speaker:
                    canonical = resolve_canonical_character(ev.speaker)
                    if canonical:
                        if canonical not in char_stats:
                            char_stats[canonical] = {
                                "first_ep": ep.episode_number,
                                "lines": 0,
                                "aliases": set(),
                            }
                        char_stats[canonical]["lines"] += 1
                        char_stats[canonical]["aliases"].add(ev.speaker)

        # 3. Canonical Character definitions
        characters_definitions = [
            Character(
                id="char_juliana",
                name="Lady Juliana",
                canonical_name="Juliana",
                role="Protagonist",
                aliases=list(char_stats.get("Juliana", {}).get("aliases", ["Juliana", "Lady Juliana"])),
                description="Resilient, noble-hearted heroine. Possesses medicinal knowledge from her late mother. Betrayed by family, marries a scarred soldier who is secretly the Duke.",
                key_traits=["Resilient", "Defiant", "Compassionate", "Master Herbalist"],
                total_lines=char_stats.get("Juliana", {}).get("lines", 446),
                first_episode=1,
            ),
            Character(
                id="char_alexander",
                name="Alexander (Duke of Ashburn)",
                canonical_name="Alexander",
                role="Romantic Lead / Hero",
                aliases=list(char_stats.get("Alexander", {}).get("aliases", ["Alexander", "Mysterious Bearded Man", "Duke"])),
                description="War-scarred decorated veteran and rightful Duke of Ashburn. Protects Juliana with lethal combat skill and supreme devotion.",
                key_traits=["Stoic", "Lethal", "Deeply Loyal", "Rightful Duke"],
                total_lines=char_stats.get("Alexander", {}).get("lines", 226),
                first_episode=3,
            ),
            Character(
                id="char_catherine",
                name="Lady Catherine",
                canonical_name="Catherine",
                role="Lead Antagonist",
                aliases=list(char_stats.get("Catherine", {}).get("aliases", ["Catherine", "Lady Catherine"])),
                description="Ruthless, status-obsessed conspirator. Slowly poisons the Dowager Duchess, frames Juliana for witchcraft, and schemes with Father Thomas.",
                key_traits=["Machiavellian", "Cruel", "Ambitious", "Vindictive"],
                total_lines=char_stats.get("Catherine", {}).get("lines", 180),
                first_episode=20,
            ),
            Character(
                id="char_gerald",
                name="Gerald Harrington",
                canonical_name="Gerald",
                role="Antagonist",
                aliases=list(char_stats.get("Gerald", {}).get("aliases", ["Gerald", "The Former Groom"])),
                description="Juliana's vain, treacherous ex-fiancé who abandons her at the altar for her sister Clarissa.",
                key_traits=["Vain", "Treacherous", "Cowardly", "Spiteful"],
                total_lines=char_stats.get("Gerald", {}).get("lines", 30),
                first_episode=1,
            ),
            Character(
                id="char_clarissa",
                name="Clarissa",
                canonical_name="Clarissa",
                role="Antagonist",
                aliases=list(char_stats.get("Clarissa", {}).get("aliases", ["Clarissa", "Lady in Gold Gown"])),
                description="Juliana's cruel, conceited sister who steals Gerald and tortures Juliana with the blackthorn briar trial.",
                key_traits=["Sadistic", "Conceited", "Spiteful", "Jealous"],
                total_lines=char_stats.get("Clarissa", {}).get("lines", 28),
                first_episode=1,
            ),
            Character(
                id="char_rupert",
                name="Rupert",
                canonical_name="Rupert",
                role="Antagonist",
                aliases=list(char_stats.get("Rupert", {}).get("aliases", ["Rupert", "Usurper"])),
                description="Treacherous usurper of the Ashburn dukedom who conspires with Catherine to poison the Duchess.",
                key_traits=["Usurper", "Ruthless", "Treasonable", "Arrogant"],
                total_lines=char_stats.get("Rupert", {}).get("lines", 22),
                first_episode=20,
            ),
            Character(
                id="char_duchess",
                name="Dowager Duchess",
                canonical_name="Dowager Duchess",
                role="Ally / Catalyst",
                aliases=list(char_stats.get("Dowager Duchess", {}).get("aliases", ["Dowager Duchess", "Duchess"])),
                description="Alexander's elderly mother, poisoned by Catherine and Rupert. Escapes through a blizzard to reunite with her son.",
                key_traits=["Noble", "Enduring", "Protective Mother"],
                total_lines=char_stats.get("Dowager Duchess", {}).get("lines", 24),
                first_episode=22,
            ),
            Character(
                id="char_father_thomas",
                name="Father Thomas",
                canonical_name="Father Thomas",
                role="Antagonist",
                aliases=list(char_stats.get("Father Thomas", {}).get("aliases", ["Father Thomas"])),
                description="Corrupt ecclesiastical authority engaged in illicit romance and treasonous conspiracy with Catherine.",
                key_traits=["Hypocritical", "Corrupt", "Opportunistic"],
                total_lines=char_stats.get("Father Thomas", {}).get("lines", 16),
                first_episode=48,
            ),
        ]
        self.graph.characters = characters_definitions

        # 4. Canonical Relationships
        self.graph.relationships = [
            Relationship(
                source="Gerald",
                target="Juliana",
                relation_type="Betrayal",
                description="Gerald humiliates Juliana at the altar to marry Clarissa.",
                dynamics="Cruel abandonment followed by spiteful harassment",
            ),
            Relationship(
                source="Alexander",
                target="Juliana",
                relation_type="Spousal & Romance",
                description="Solemn marriage forged in exile, maturing into fierce protective love.",
                dynamics="Deep tenderness, mutual sacrifice, and protective vengeance",
            ),
            Relationship(
                source="Clarissa",
                target="Juliana",
                relation_type="Rivalry & Sadism",
                description="Jealous sister who steals Gerald and inflicts the blackthorn briar ordeal.",
                dynamics="Vindictive sibling cruelty vs unshakeable moral strength",
            ),
            Relationship(
                source="Catherine",
                target="Juliana",
                relation_type="Mortal Enmity",
                description="Catherine poisons Alexander's mother and frames Juliana for witchcraft.",
                dynamics="Dungeon interrogation, hot-iron torture, and public trial",
            ),
            Relationship(
                source="Rupert",
                target="Alexander",
                relation_type="Usurpation",
                description="Rupert steals Alexander's dukedom and attempts to execute his wife.",
                dynamics="High treason broken by Alexander's armed cathedral return",
            ),
            Relationship(
                source="Catherine",
                target="Father Thomas",
                relation_type="Treasonous Affair",
                description="Illicit passion and political conspiracy in the abandoned manor wing.",
                dynamics="Sensual corruption, mutual blackmail, and covert subversion",
            ),
        ]

        # 5. Populate Knowledge Graph Nodes and Edges
        # Character Nodes
        for char in self.graph.characters:
            self.graph.nodes.append(
                NarrativeNode(
                    id=f"char_{char.canonical_name.lower().replace(' ', '_')}",
                    label=char.name,
                    node_type="character",
                    metadata={"role": char.role, "traits": ", ".join(char.key_traits)},
                )
            )

        # Arc Nodes
        for arc in self.graph.arcs:
            self.graph.nodes.append(
                NarrativeNode(
                    id=arc.id,
                    label=arc.title,
                    node_type="arc",
                    metadata={
                        "episodes": f"Ep {arc.episode_start}-{arc.episode_end}",
                        "conflict": arc.core_conflict,
                        "tone": arc.emotional_tone,
                    },
                )
            )

        # Relationship Edges
        for rel in self.graph.relationships:
            src_id = f"char_{rel.source.lower().replace(' ', '_')}"
            tgt_id = f"char_{rel.target.lower().replace(' ', '_')}"
            self.graph.edges.append(
                NarrativeEdge(
                    source=src_id,
                    target=tgt_id,
                    relation=rel.relation_type,
                    weight=1.0,
                )
            )

        # Major Narrative Chains: Character -> Event -> Episode -> Conflict -> Consequence
        narrative_chains = [
            ("Juliana", "Altar Betrayal", 1, "Public Humiliation", "Accepts Soldier's Proposal"),
            ("Gerald", "Mockery at Cottage", 7, "Arrogant Harassment", "Alexander Drives Them Off"),
            ("Clarissa", "Blackthorn Briar Ordeal", 13, "Sadistic Torture", "Juliana Proves Indomitable"),
            ("Alexander", "Garden Defense", 16, "Mercenary Ambush", "Gerald Unmasked as Mastermind"),
            ("Catherine", "Arsenic Poisoning", 25, "Slow Murder of Duchess", "Juliana Hides Antidote"),
            ("Catherine", "Witchcraft Frame", 31, "Red-Hot Iron Torture", "Alexander Vows Vengeance"),
            ("Alexander", "Cathedral Gate Assault", 42, "Wedding Usurpation", "Reclaims Dukedom & Crowns Juliana"),
            ("High Priest", "Marriage Invalidation", 46, "Ecclesiastical Challenge", "10-Day Council Reprieve"),
            ("Catherine", "Affair with Father Thomas", 50, "Covert Conspiracy", "Witnessed by Agnes"),
        ]

        for char_name, ev_label, ep_num, conflict_label, conseq_label in narrative_chains:
            ev_id = f"ev_ep{ep_num}_{ev_label.lower().replace(' ', '_')}"
            conf_id = f"conf_ep{ep_num}_{conflict_label.lower().replace(' ', '_')}"
            conseq_id = f"conseq_ep{ep_num}_{conseq_label.lower().replace(' ', '_')}"

            self.graph.nodes.append(NarrativeNode(id=ev_id, label=f"Ep {ep_num}: {ev_label}", node_type="event", metadata={"episode": str(ep_num)}))
            self.graph.nodes.append(NarrativeNode(id=conf_id, label=conflict_label, node_type="conflict", metadata={"episode": str(ep_num)}))
            self.graph.nodes.append(NarrativeNode(id=conseq_id, label=conseq_label, node_type="reveal", metadata={"episode": str(ep_num)}))

            char_id = f"char_{char_name.lower().replace(' ', '_')}"
            self.graph.edges.append(NarrativeEdge(source=char_id, target=ev_id, relation="participates_in", episode=ep_num))
            self.graph.edges.append(NarrativeEdge(source=ev_id, target=conf_id, relation="creates_conflict", episode=ep_num))
            self.graph.edges.append(NarrativeEdge(source=conf_id, target=conseq_id, relation="triggers_consequence", episode=ep_num))

    def get_arc_for_episode(self, ep_num: int) -> StoryArc:
        """Find the story arc covering a given episode."""
        for arc in self.graph.arcs:
            if arc.episode_start <= ep_num <= arc.episode_end:
                return arc
        return self.graph.arcs[0]

    def evaluate_standalone_comprehensibility(
        self, episode_number: int, events: List[ScreenplayEvent]
    ) -> Tuple[float, List[str], List[str]]:
        """
        Evaluate standalone comprehensibility for a new viewer.
        Returns:
            (score_0_to_100, strengths, warnings)
        """
        score = 80.0
        strengths = []
        warnings = []

        # Check dialogue presence
        dialogues = [e for e in events if e.event_type.value == "dialogue"]
        if not dialogues:
            warnings.append("Segment lacks spoken dialogue to anchor narrative stakes.")
            score -= 25.0
        else:
            strengths.append("Clear verbal confrontation present.")

        # Identify speakers
        speakers = {resolve_canonical_character(e.speaker) for e in dialogues if e.speaker}
        speakers.discard(None)

        if len(speakers) >= 2:
            strengths.append(f"Clear binary confrontation between {', '.join(speakers)}.")
            score += 10.0
        elif len(speakers) == 1:
            warnings.append("Single speaker monologue may lack evident opposing stakes.")
            score -= 10.0

        # Check for confusing off-screen pronouns or deep-arc lore
        lore_terms = ["arsenic", "ledger", "mother's book", "council", "ten-day", "high priest", "antidote"]
        transcript = " ".join([e.content.lower() for e in events])
        
        found_lore = [term for term in lore_terms if term in transcript]
        if found_lore:
            # If in later episodes (Ep 20-50), lore terms might be confusing without setup
            if episode_number > 20:
                warnings.append(f"Contains specialized lore terms: {', '.join(found_lore)} which require premise awareness.")
                score -= 8.0

        # Check if basic premise is self-explanatory (marriage, betrayal, trial, identity)
        universal_hooks = ["marry", "wedding", "husband", "sister", "traitor", "duke", "arrest", "hang", "kill", "wife"]
        found_hooks = [hook for hook in universal_hooks if hook in transcript]
        if found_hooks:
            strengths.append(f"Universal microdrama premise cues detected: {', '.join(found_hooks[:3])}.")
            score += 10.0

        # Clamp between 20 and 100
        final_score = max(20.0, min(100.0, score))
        return round(final_score, 1), strengths, warnings

