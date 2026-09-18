# database

MongoDB connection handling, models and indexes.

**Task:** 2 (database schema v1).

**Collections**

```text
incidents
incident_events
conversation_messages
protocols
sessions
handoffs
users          (responders and admins only)
```

Every incident-scoped record carries `incidentId` (or is the incident itself).
Events are append-only. Timeline order is `sequence`, a monotonic integer
assigned when the event is written, not `occurredAt`.

**Indexes**

| Collection | Index | Why |
|---|---|---|
| `incidents` | `_id` | lookup |
| `incidents` | `{ status: 1, updatedAt: -1 }` | responder list |
| `incidents` | `{ sessionId: 1, createdAt: -1 }` | reconnect |
| `incidents` | `{ "state.emergencyType": 1, status: 1 }` | dashboard filter |
| `incident_events` | `{ incidentId: 1, sequence: 1 }` unique | chronological replay |
| `conversation_messages` | `{ incidentId: 1, createdAt: 1 }` | conversation order |
| `protocols` | `{ emergencyType: 1, published: 1 }` | protocol selection |
| `handoffs` | `{ incidentId: 1, version: -1 }` unique | latest snapshot |
| `users` | `{ email: 1 }` unique sparse | responder login |
| `sessions` | `{ expiresAt: 1 }` | expiry |

Identifiers are UUID strings, stored as `_id`, and returned as `id` on the
shared types. Timestamps are ISO-8601 strings so a value is identical in
MongoDB, JSON, and the browser.

`GET /api/health` reports `database: "up"` when the ping succeeds, `"down"`
when `MONGODB_URI` is set but the ping fails, and `"unknown"` when no URI is
configured (local scaffold without Atlas).
