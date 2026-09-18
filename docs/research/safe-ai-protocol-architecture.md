# Safe AI + protocol architecture

## Core engineering principle (Decision)

```text
LLM understands language
  → Emergency State determines what is known
  → Protocol Engine determines what can safely be instructed
  → Voice response guides the user
  → User action updates state
```

The LLM is a **language component**, not the medical authority.

## Why unrestricted LLM medical chat is unsafe (Research + Decision)

**Research / industry consensus (general):** Large language models can hallucinate procedures, omit contraindications, and sound confident when uncertain. Using them as free-form “AI doctors” is inappropriate for emergency first response.

**Decision for DERES:**

| Layer | May do | Must not do |
|---|---|---|
| LLM | NLU, structured extraction, phrasing, multilingual interpretation | Invent procedures, override protocol, hide uncertainty, diagnose |
| Emergency state | Track known / unknown / uncertain facts | Silently overwrite contradictory answers as certain |
| Protocol engine | Select allowed questions/actions/escalations | Be bypassed by model improvisation |
| Safety pipeline | Reject invalid model output before user hears it | Partially apply unsafe guidance |

Validation chain (Decision — task.md Phase 7 / Task 8):

```text
LLM output → schema → state → protocol → safety rules → response
```

## Structured emergency state (Decision)

Incident state is the memory of the emergency. Conversation transcripts are evidence; **state** is what protocols read. Uncertainty is first-class (`Certainty`, `UncertaintyNote` in `@voicesos/shared`).

## Conversation → handoff (Decision)

Handoff must only contain supported facts. Unknown/uncertain items stay visible so responders do not read silence as “normal.”

## Connectivity (Hypothesis + Decision)

**Hypothesis:** Scene connectivity may be unreliable.  
**Decision for MVP:** Graceful failure and clear UI (Task 26); investigate cached protocol content later. Full offline LLM is **out of MVP**.

## Traceability

| Assumption | Label | Trace |
|---|---|---|
| Protocol engine is the safety boundary | Decision | Spec §11, §25; git-workflow §33 |
| LLM must return structured, validated output | Decision | Spec §23–§25; Task 7–8 |
| Uncertainty must be preserved | Decision | Shared contracts; Task 3 agreement |
| Offline full AI required for MVP | Rejected | Spec “WILL NOT BUILD” |
