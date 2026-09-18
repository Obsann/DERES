# Voice interaction under emergency cognitive load

## Claim

**Decision (STARK + product):** Voice is the primary interface for DERES — not a novelty layer.

## Why voice (mix of Research rationale + Decision)

Emergencies often involve:

- Both hands occupied (bleeding control, supporting a person, moving debris)
- Need to watch the patient, not a dense screen
- High stress / reduced ability to read long text
- Possible low literacy or language mismatch with written UI

**Hypothesis (labeled):** Under acute stress, short spoken turn-taking (“one question → one action → confirm”) reduces error vs multi-step on-screen menus.  
We treat this as a **hypothesis** for UX validation (Samuel Tasks 30–34), not as proven clinical HCI fact for Ethiopia-specific emergencies.

## Design consequences (Decision)

From engineering spec UX principles and Melkamu Task 20 constraints:

- Prefer **one critical question** or **one instruction** at a time
- Spoken responses stay short and action-oriented
- Confirmation before assuming an action was completed
- Screen supports voice; it does not replace it in the MVP story
- Failure modes (mic denied, recognition failure, silence) need explicit UI (Task 26)

## Voxide role (Decision)

Voxide is the speech I/O layer. Language coverage (Amharic, Afaan Oromo, English) is **Hypothesis/pending confirmation** until Task 9 verifies real provider capabilities. Product must not claim three languages end-to-end until verified.

## Traceability

| Assumption | Label | Trace |
|---|---|---|
| Voice is primary interface | Decision | Spec §31, STARK voice requirement, UX principles |
| Hands-busy / high-stress users benefit from voice | Hypothesis | Spec §31; validate in UX review |
| Voxide supports target languages at demo quality | Hypothesis | Pending Task 9 |
| One-question / one-action pattern is safer under load | Decision | Spec interaction pattern; Samuel UX to enforce |
