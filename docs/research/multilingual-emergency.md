# Multilingual emergency communication

## Target languages (Decision + Hypothesis)

**Decision:** Investigate English, Amharic, and Afaan Oromo for MVP demonstration.

**Hypothesis / gate:** Actual support and quality depend on Voxide (and any LLM multilingual quality). Do not trade safety for language count (task.md Phase 13).

## Architecture principle (Decision)

```text
User language
  → Speech recognition
  → Semantic understanding
  → Language-independent emergency state
  → Protocol engine
  → Localised response
  → Speech synthesis
```

Emergency **logic** is not duplicated per language. Protocol prompts may be localised (`LocalisedText` in shared contracts); state fields stay language-independent.

## Evidence notes (Research / Hypothesis)

- EMS-use research in Addis Ababa has reported language as a factor associated with ambulance use (non-Amharic speakers disadvantaged in at least one study — see BMC Emerg Med 2019 in `sources.md`). This supports multilingual access as a **product priority**, not proof that DERES voice quality will succeed.
- RapidSOS and similar platforms already invest in transcription/translation for **dispatchers**. DERES focuses multilingual voice on the **bystander** (Decision).
- Cross-lingual SER and low-resource corpus methods are on the teammate-verified reading list ([arXiv:2003.07996](https://arxiv.org/abs/2003.07996), [arXiv:2507.09618](https://arxiv.org/abs/2507.09618)). **Hypothesis until opened locally:** Amharic / Afaan Oromoo emergency ASR will need Ethiopian recordings, not English-acted data.

## UX implications (Decision — Samuel Task 35)

- Check text expansion, terminology consistency, mixed-language input
- Critical instructions must not change meaning across languages
- Layout must not break for Amharic / Afaan Oromo scripts

## Traceability

| Assumption | Label | Trace |
|---|---|---|
| Three languages in investigation set | Decision | Spec §13; task.md Phase 13 |
| All three ship at equal quality in MVP | Hypothesis | Pending Voxide + evaluation |
| State is language-independent | Decision | Spec §13; shared `EmergencyState` |
| Multilingual matters for Ethiopian EMS access | Research (supporting) | EMS language association studies |
