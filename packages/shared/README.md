# @voicesos/shared

Canonical type contracts for DERES (Team COD1). Shared by `apps/server` and `apps/web`.

```text
src/
├── enums/       EmergencyType, IncidentStatus, Certainty, VoiceSessionPhase, ...
├── types/       Incident, EmergencyState, Protocol, Handoff, AuthUser, API shapes
├── events/      Socket.IO event names and payloads
├── factories/   initialEmergencyState, initialIncident (same empty state everywhere)
└── contracts.inventory.ts   Task 3 required-symbol checklist (type-level)
```

## Usage

```ts
import {
  EmergencyType,
  initialIncident,
  isApiSuccess,
  type Incident,
} from '@voicesos/shared';
```

```bash
npm run build --workspace @voicesos/shared
```

## Rules

1. **Never redefine these shapes inside an app** (git-workflow.md §30).
2. **Changing an exported shape is an API change** — tell Melkamu/Obsan first (§36).
3. **Uncertainty is part of the contract** — do not drop `Certainty` / `UncertaintyNote`.
4. **Timestamps are ISO-8601 strings**, not `Date`.

## Agreement

Field-level Melkamu ↔ Obsan agreement lives in
[`docs/api/shared-contracts.md`](../../docs/api/shared-contracts.md).

## Task 3 status

Required interfaces from `team_assignments.md` Task 3 are exported and covered by
`contracts.inventory.ts`. Runtime Zod validation belongs in `packages/validation`
(Task 8), not duplicated here.
