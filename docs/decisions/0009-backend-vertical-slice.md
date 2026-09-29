# ADR 0009 — Wire the vertical slice on the shared contracts

**Status:** Accepted  
**Date:** 2026-09-29  
**Task:** 14 (backend integration pass)

## Decision

Production startup injects the real LLM and Voxide clients into `createApp`.
HTTP paths the web client already calls (`POST /api/sessions`,
`POST /api/incidents/:id/voice`, `GET /api/protocols`) are served by the same
handlers as the server-native routes. Vite proxies `/socket.io` as well as
`/api`.

## Why

Each layer was built on its own branch. The demo path is voice → state →
protocol → handoff → live dashboard. If production never passed the LLM into
Express, or if the dashboard posted to a path the server did not mount, that
path would stay a set of disconnected pieces.

## Consequences

- Tests still call `createApp()` without providers so they do not hit paid APIs.
- `VoiceTurnRequest` / `VoiceTurnResponse` gained the transcript and reply
  fields the server already used. Existing `phase` / `voiceSessionId` remain.
- Missing LLM on a voice turn is `UPSTREAM_UNAVAILABLE` (503), not a
  validation error.
- Melkamu's dashboard can use the shared client against this server without a
  path fork.
