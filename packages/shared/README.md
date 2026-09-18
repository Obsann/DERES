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

