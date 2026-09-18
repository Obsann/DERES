# database

MongoDB connection handling, models and indexes.

**Task:** 2 (database schema v1).

**Collections**

```text
incidents
incident_events
protocols
sessions
handoffs
users          (responders and admins only)
```

Every incident-scoped record is traceable to its incident, and indexes support
incident lookup and event ordering.

Until Task 2 lands, `GET /api/health` reports `database: "unknown"` rather
than claiming a healthy connection that does not exist.
