# Scenario-differentiated first-minute protocols

**Status:** Encoded in `packages/protocols` as of 2026-10-07  
**Rule:** the LLM extracts facts. It never writes a medical line. Each scene has its own published protocol, or it escalates to 907 without a procedure.

This file records the first-minute map DERES actually ships. It is not a substitute for the source PDFs, and it does not invent accuracy numbers, tourniquet placement millimetres, or papers that were not opened in this workspace.

## Why one script is wrong

| Scene | First minute | Failure if treated as collapse CPR |
|---|---|---|
| Collapse / unresponsive adult | Check response, call, airway, breathing, compressions or recovery | (this *is* the ERC BLS path) |
| Suspected stroke | Call ambulance, then FAST observation, nothing by mouth | Compressions delay transport |
| Choking (adult, severe) | Call, 5 back blows, 5 abdominal thrusts, repeat; no blind finger sweep | Wrong manoeuvre; object pushed deeper |
| Severe limb bleeding | Call, direct pressure, pack, tourniquet high and tight, never release | Uncontrolled bleeding; folklore dressings |
| Burns | Call, cool under running water 10–20 minutes | Ice, butter, oil, toothpaste |
| Crash / injury | Call, do not move unless immediate danger, do not pull impaled objects | Worsening a possible spine injury |
| Something else, seizure, allergy | Call 907. No published protocol | Invented treatment |

Seizure and severe allergic reaction stay on `EmergencyType` for classification only. They are not guided in this build.

## What is encoded (first-minute steps only)

Sources named below are the team evidence map (WHO CFAR, WHO Prehospital protocols, IFRC Guidelines 2020, ILCOR CoSTR first aid, TECC Active Bystanders 2020, ERC BLS for collapse). Product copy does **not** quote FAST sensitivity percentages or RCT effect sizes until those PDFs are opened locally.

| Protocol id | Opening button | Locked first-minute path |
|---|---|---|
| `protocol-unconscious-adult` | Collapsed / not responding | ERC BLS: response → 907 → airway → breathing → compressions or recovery |
| `protocol-suspected-stroke` | Possible stroke | 907 first, then observational FAST (face, arms, speech), nothing by mouth |
| `protocol-choking` | Choking | 907, 5 back blows, 5 abdominal thrusts, repeat; no finger sweep; infant/child escalate |
| `protocol-severe-bleeding` | Severe bleeding | 907, press, pack, tourniquet high/tight if a limb still bleeds life-threateningly; never release |
| `protocol-burns` | Burn | 907, cool 10–20 min running water; no ice/butter/oil/toothpaste |
| `protocol-traumatic-injury` | Crash or injury | 907, do not move unless fire/traffic, do not remove impaled objects |

`other` records an unclassified scene and speaks a safe phrase. No procedure is invented.

## Honesty notes

- FAST campaign / meta-analysis figures from the team map stay here as **not yet cited in UI**. Do not put 80–86% (or any other accuracy number) on the landing page until the systematic-review PDF is opened in this workspace.
- Verbal-only tourniquet teaching is weak. The bleeding protocol confirms each skill step; it does not claim a bystander will place a tourniquet correctly from speech alone.
- Cross-protocol switch (trauma that later becomes unresponsive) is not automatic. The stay steps tell the helper to tell the operator.
- Amharic and Afaan Oromoo prompts are drafts pending native-speaker review (`docs/ux/translation-review.md`).

## Related

- ADR 0011 — six published first-minute protocols
- ADR 0003 — original unresponsive-adult protocol (still the collapse path)
- ADR 0004 — LLM is a language component
- Assumptions A9, A23, A24
