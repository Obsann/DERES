# protocols

The protocol engine. Loads machine-readable protocols, selects one for an
incident, and decides which step and which instruction are permitted next.

**Tasks:** 5 (protocol engine foundation), 6 (MVP emergency protocol).

**Boundary — this is the safety boundary.** The protocol engine, not the LLM,
determines what guidance is allowed. The model may rephrase an approved
instruction; it may never originate one, extend one, or route around a
contraindication.

Execution is data-driven:

```text
entry conditions → current step → accepted answer or confirmation
        → first matching transition → next step
```

Unsupported transitions, unpublished protocols, and contraindicated
instructions throw `ProtocolViolationError`. Uncertain answers follow the
step's `onUncertain` path instead of guessing.

The Task 5 fixture in `fixtures/foundationProtocol.ts` only proves the engine.
The published MVP protocol lives in `@voicesos/protocols`: unresponsive adult
Basic Life Support, sourced from ERC Guidelines 2021.

Anything merged here needs code review, tests, an authoritative source, and
explicit acceptance criteria (git-workflow.md section 33).
