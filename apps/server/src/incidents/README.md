# incidents

The incident record and the emergency state engine: creating an incident,
applying validated state changes, appending timeline events, and serving the
incident API.

**Tasks:** 4 (emergency state engine), 10 (incident API).

**Boundary.** This module owns what is *known* about an emergency. It does not
decide what the user should be told — that is `protocols/`. It rejects invalid
transitions rather than letting a bad update through, and it never edits or
deletes a timeline event, so an incident can always be replayed from its events
in `sequence` order.

**Endpoints (Task 10)**

```text
POST   /api/incidents
GET    /api/incidents/:id
PATCH  /api/incidents/:id
POST   /api/incidents/:id/messages
POST   /api/incidents/:id/actions
GET    /api/incidents/:id/timeline
```
