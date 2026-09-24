# ADR 0008 — Socket.IO rooms for live incidents

**Status:** Accepted  
**Date:** 2026-09-24  
**Task:** 13 (real-time incident infrastructure)

## Decision

Attach Socket.IO to the existing HTTP server. Event names and payloads stay
in `@voicesos/shared`. Authenticated responder sockets join `responders` for
new and closed incidents, and `incident:{id}` after `incident.subscribe`.
Persisted writes emit; HTTP handlers do not.

## Why

The dashboard must update without a refresh while a bystander is still
talking. If emit lived only on HTTP routes, voice turns would stay invisible
until someone reloaded. Rooms keep one incident's timeline off every other
dashboard.

## Consequences

- Handshake requires the same responder HMAC token as Task 12.
- `incident.created`, `incident.updated`, and `incident.closed` go to the
  responder list. Detail events stay on the incident room.
- Subscribe sends the current snapshot so a reconnect does not need a
  refresh. Duplicate emits of the same row are dropped.
- Melkamu wires the dashboard listeners in Task 24.
