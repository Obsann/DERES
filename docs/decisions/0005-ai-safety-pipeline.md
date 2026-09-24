# ADR 0005 — AI safety pipeline

**Status:** Accepted  
**Date:** 2026-09-24  
**Task:** 8 (AI safety validation pipeline)

## Decision

Every model payload passes `runSafetyPipeline` before any incident command
is applied:

`schema → state → protocol → safety rules → response`

## Why

Schema validation alone still lets a well-formed extraction invent an
answer, hide uncertainty, or smuggle guidance into an observation. Each
stage has a different refusal reason so a blocked turn is visible in logs.

## Consequences

- A failure throws `AiValidationError` and applies nothing.
- The user never hears model-authored medical text. The reply after a
  successful turn is still a protocol prompt or a fixed safe phrase.
- Unsupported requests that pass the pipeline are answered with the safe
  refusal line plus the current protocol step, not with the requested act.
