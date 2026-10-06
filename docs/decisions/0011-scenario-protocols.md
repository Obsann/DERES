# ADR 0011 — First-minute protocols are scene-specific

**Status:** Accepted  
**Date:** 2026-10-07  
**Supersedes in part:** ADR 0003 (the “only one guided type” constraint). The unresponsive-adult protocol itself remains the collapse path.

## Decision

Publish a separate protocol for each opening scene that has a sourced first-minute path:

1. Unresponsive adult (existing ERC BLS)
2. Suspected stroke (call, then FAST observation)
3. Choking (back blows then abdominal thrusts)
4. Severe bleeding (pressure, pack, tourniquet)
5. Burns (cool 10–20 minutes)
6. Crash or injury (do not move, do not remove impaled objects)

`other`, seizure, and severe allergic reaction stay unclassified or typed without a published protocol. The engine escalates to 907 and does not invent steps.

## Why

A crash and a possible stroke are not a collapse. One generic first-aid script would give the wrong physical work (compressions, cooling, packing) to the wrong scene. Stroke is recognition and transport. Choking and bleeding are skill sequences. Burns are a timed cooling action. Trauma is “do not make it worse.”

## Consequences

- `SceneStart` maps each button to an `EmergencyType`. The protocol engine selects by that type.
- Observational yes/no questions (FAST) record answers without new patient-state fields.
- Call-EMS steps are recognised by `call-ems` in the step id, not a single hard-coded collapse step id.
- Product copy must not claim a single published protocol.
