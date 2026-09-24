# ADR 0007 — Anonymous sessions, protected responders

**Status:** Accepted  
**Date:** 2026-09-24  
**Task:** 12 (security and session framework)

## Decision

Bystanders stay anonymous. A session id is enough to open and continue an
emergency. Responder and admin routes require a bearer token minted only
after a shared invite check. The invite and `SESSION_SECRET` are never
returned in a response.

## Why

Someone in an emergency must not create an account. A responder dashboard
must not be world-readable.

## Consequences

- `POST /api/auth/session` issues a session id.
- `POST /api/auth/responder` issues an HMAC token.
- `GET /api/responder/*` and `GET /api/incidents/:id/handoff` reject
  unauthenticated requests.
- Production requires `SESSION_SECRET` and `RESPONDER_INVITE`.
- Logs already redact credentials, tokens, transcripts, and location.
