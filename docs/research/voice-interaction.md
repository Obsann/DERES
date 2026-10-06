# Voice interaction under emergency cognitive load

## Claim

**Decision (STARK + product):** Voice is the primary interface for DERES — not a novelty layer.

## Why voice (mix of Research rationale + Decision)

Emergencies often involve:

- Both hands occupied (bleeding control, supporting a person, moving debris)
- Need to watch the patient, not a dense screen
- High stress / reduced ability to read long text
- Possible low literacy or language mismatch with written UI

**Research (not Ethiopia-specific):** On a real French emergency-call corpus (CEMO), audio encoded more emotion than text, and multimodal fusion gained about 4–9% ([arXiv:2306.07115](https://arxiv.org/abs/2306.07115)). Product implication: treat emergency speech as noisy and incomplete; **large buttons must remain first-class**, not a fallback after ASR fails.

A teammate-verified list also flags acted-emotion corpora transferring poorly ([arXiv:2207.02104](https://arxiv.org/abs/2207.02104)) — **do not cite that number in demo copy until the abs/PDF is opened locally.**

**Hypothesis (labeled):** Under acute stress in Ethiopian scenes, short spoken turn-taking (“one question → one action → confirm”) reduces error vs multi-step on-screen menus.  
We treat the *Ethiopia-specific HCI benefit* as a **hypothesis** for UX validation (Samuel Tasks 30–34). The CEMO finding is Research for “emergency speech is hard,” not proof that DERES ASR will succeed in Amharic.

## Design consequences (Decision)

From engineering spec UX principles and Melkamu Task 20 constraints:

- Prefer **one critical question** or **one instruction** at a time
- Spoken responses stay short and action-oriented
- Confirmation before assuming an action was completed
- Screen supports voice; large buttons stay first-class so the protocol continues when speech is stressed or the mic fails
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
