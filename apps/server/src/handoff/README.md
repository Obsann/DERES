# handoff

Turns an incident's state and timeline into the structured summary a
professional responder receives.

**Task:** 11 (handoff service).

**Boundary.** A handoff may only contain what the incident record supports. It
must never assert information that was never established. Unknown and
uncertain facts are carried through and shown as such — that is the point of
`Certainty` and `UncertaintyNote` in the shared contracts.

**Endpoint:** `GET /api/incidents/:id/handoff`
