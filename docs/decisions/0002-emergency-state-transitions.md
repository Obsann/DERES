# ADR 0002 — Emergency state transitions

**Status:** Accepted  
**Date:** 2026-09-22  
**Task:** 4 (emergency state engine)

## Decision

All incident mutations go through `applyCommand` in `apps/server/src/incidents`.
Persistence stores the result and appends timeline events. Callers, including
the LLM, may only propose an `IncidentCommand`.

## Why

The emergency state is the structured picture the protocol engine reads. If
any path can write `EmergencyState` directly, a bad update can invent a fact,
drop uncertainty, or rewrite history. A single transition function keeps
those rules in one place.

## Rules

- Closed incidents cannot change. Abandoned incidents must be recovered
  first. Handed-off incidents can only be closed.
- Escalation only moves `none → recommended → escalated`, never backwards.
- A contradictory fact is not overwritten with the new value and is not left
  as the earlier assumption. The field moves to its UNKNOWN sentinel and an
  `UncertaintyNote` is recorded.
- Answers are appended. Changing an answer does not edit or delete the
  previous answer or any earlier timeline event.
- Only the current protocol step can be completed. A second protocol cannot
  replace one that is already selected.

## Consequences

- Incident history is reconstructed from append-only `incident_events`.
- Protocol and AI tasks (5–8) apply commands; they do not patch state.
