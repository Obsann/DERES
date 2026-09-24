# ADR 0006 — Voxide is the speech layer

**Status:** Accepted  
**Date:** 2026-09-24  
**Task:** 9 (Voxide integration)

## Decision

Voxide handles microphone input and spoken output in the browser. DERES
owns meaning, state, and what may be said. The server voice API accepts a
transcript (or audio to transcribe) and returns the next protocol prompt
or a fixed safe phrase.

## Why

Voxide is a client voice SDK, not a medical authority. If it were allowed
to invent the spoken instruction, the protocol engine would be bypassed.

## Consequences

- `POST /api/voice/sessions` opens an anonymous incident.
- `POST /api/voice/sessions/:incidentId/turns` classifies the utterance
  (silence, timeout, failed recognition, repeat, or process) before the
  LLM and protocol engine run.
- Audio is not stored. Only transcripts are persisted.
- `VOXIDE_API_KEY` / `VOXIDE_BASE_URL` are used when the client sends
  audio instead of a transcript. Tests inject `ScriptedVoxideProvider`.
