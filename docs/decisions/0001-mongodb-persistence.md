# ADR 0001 — MongoDB for incident persistence

**Status:** Accepted  
**Date:** 2026-09-18  
**Task:** 2 (database schema v1)

## Decision

Use MongoDB (Mongoose) as the MVP store for incidents, events, protocols,
sessions, handoffs, and responder users.

## Why

Incident state, conversation transcripts, and protocol documents are nested
and evolve during a session. A document model matches the shared TypeScript
contracts without a large join surface. MongoDB Atlas is the hosting path
called out in the engineering specification.

PostgreSQL remains viable later if we need stricter relational reporting. It
is not required for the hackathon vertical slice.

## Consequences

- Shared `Id` values are UUID strings, not ObjectIds, so API and database
  identifiers stay the same.
- Timestamps stay ISO-8601 strings end to end.
- `incident_events` is append-only. Replay order is `sequence`.
- Schema enforcement lives in Mongoose models that mirror `@voicesos/shared`.
