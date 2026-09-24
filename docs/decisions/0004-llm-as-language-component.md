# ADR 0004 — LLM is a language component

**Status:** Accepted  
**Date:** 2026-09-24  
**Task:** 7 (LLM orchestration service)

## Decision

Use an OpenAI-compatible Chat Completions API (`LLM_BASE_URL`, `LLM_MODEL`,
`LLM_API_KEY`) to interpret user speech into a strict JSON extraction. The
model must not author medical instructions. Spoken guidance comes from the
active protocol step or from a fixed safe phrase.

## Why

The product rule is: LLM understands language → emergency state holds what
is known → protocol engine decides what may be said. If the model can return
a free-text instruction, it becomes the medical authority.

## Consequences

- Model output is a closed set of extraction fields. Keys such as
  `instruction`, `procedure`, or `reply` fail validation and the turn is
  discarded.
- Tests inject a scripted provider so the orchestration path does not need a
  live key.
- Provider choice can change (OpenAI, Groq, and others) without changing
  the extraction schema or the protocol engine.
