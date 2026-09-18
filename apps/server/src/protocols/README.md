# protocols

The protocol engine. Loads machine-readable protocols, selects one for an
incident, and decides which step and which instruction are permitted next.

**Tasks:** 5 (protocol engine foundation), 6 (MVP emergency protocol).

**Boundary — this is the safety boundary.** The protocol engine, not the LLM,
determines what guidance is allowed. The model may rephrase an approved
instruction; it may never originate one, extend one, or route around a
contraindication.

Anything merged here needs code review, tests, an authoritative source, and
explicit acceptance criteria (git-workflow.md section 33).

Protocol content itself lives in `packages/protocols`; this module executes it.
