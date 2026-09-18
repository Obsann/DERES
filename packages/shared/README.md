# @voicesos/shared

Canonical type contracts shared by `apps/server` and `apps/web`.

```text
src/
├── enums/    EmergencyType, IncidentStatus, Certainty, UserRole, ...
├── types/    Incident, IncidentEvent, EmergencyState, Protocol, ProtocolStep,
│             ConversationMessage, ActionRecord, Handoff, AuthUser, API shapes
└── events/   Socket.IO event names and payloads
```

## Usage

```ts
import { EmergencyType, isApiSuccess, type Incident } from '@voicesos/shared';
```

Run `npm run build --workspace @voicesos/shared` after changing anything here;
the server consumes the compiled `dist/`.

## Rules

1. **Never redefine these shapes inside an app.** Two copies of `Incident` that
   disagree is the failure this package exists to prevent (git-workflow.md
   section 30).
2. **Changing an exported shape is an API change.** Tell the other side before
   merging it (git-workflow.md section 36).
3. **Uncertainty is part of the contract.** `Certainty`, `UncertaintyNote` and
   the `certainty` field on `HandoffFact` exist so the UI can distinguish
   "established" from "never established". Do not drop them for convenience.
4. **Timestamps are ISO-8601 strings**, not `Date`, so a value is identical in
   MongoDB, in JSON and in the browser.

## Locked contract decisions

Platform owner sign-off (Task 3). Do not silently reverse these.

- `EmergencyState.actions` is one list of `ActionRecord` carrying an
  `ActionStatus`, rather than the separate `actionsGiven` / `actionsConfirmed`
  lists sketched in task.md Phase 4. Confirmed actions are the entries with
  status `CONFIRMED`.
- `Protocol.steps` is a single list of `ProtocolStep` discriminated by
  `ProtocolStepKind`, covering the questions, states and actions that task.md
  Phase 3 lists separately.
- `EmergencyType` currently lists all seven candidate scenarios from
  specification section 10. The MVP only supports whichever ones get an
  approved protocol in Task 6. Unapproved values may exist on the type; a
  protocol must still be published before the engine will use them.
