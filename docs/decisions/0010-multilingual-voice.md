# ADR 0010 — Multilingual protocol text and Voxide as a relay

**Status:** Accepted
**Date:** 2026-09-30
**Tasks:** 9, 21, 35

## Decision

1. Every spoken line exists as fixed text in English, Amharic and Afaan Oromoo:
   protocol prompts (`packages/protocols`), escalation instructions, safe phrases
   (`ai/phrases.ts`) and voice-failure phrases (`voice/classify.ts`). The
   incident's language selects the line. Nothing is machine-translated at runtime.
2. Voxide runs in the browser (Gemini Live) and acts only as ears and mouth. It
   sends each utterance to `POST /api/incidents/:id/voice` through the
   `reportToDeres` capability and is instructed to read back `sayExactly` verbatim.
3. The browser shares location once per incident. A later spoken description is
   merged with the coordinates rather than replacing them, and the reverse.

## Why

`stepPrompt` fell back to English, so an Amharic caller heard English
instructions. Runtime translation by the LLM or by Gemini would put an
unreviewed model between the protocol and the bystander.

Voxide's public SDK is a browser agent with a publishable key. It has no
documented server transcription endpoint, so the integration lives in the web app.

## Consequences

- A protocol may only list a language in `languages` when every step and
  escalation rule has text for it; a test enforces this.
- The Amharic and Afaan Oromoo text is a draft until reviewed
  (`docs/ux/translation-review.md`).
- Gemini Live can still paraphrase. The on-screen instruction card carries the
  exact protocol text and is the authority.
- The ambulance number (907) is configurable per deployment.
