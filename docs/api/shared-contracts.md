# Shared type contracts — Task 3 agreement

**Owners:** Obsan + Melkamu (must agree live; do not fork copies)  
**Package:** `@voicesos/shared`  
**Product:** DERES (package name remains `@voicesos/*` for continuity)

## Required symbols (Task 3)

| Symbol | Status | Notes |
|---|---|---|
| `Incident` | Agreed | Nested `state: EmergencyState`; anonymous `userId: null` allowed |
| `IncidentEvent` | Agreed | Append-only; ordered by `sequence` |
| `EmergencyState` | Agreed | Uncertainty is first-class via `uncertainty[]` + `Certainty` |
| `Protocol` / `ProtocolStep` | Agreed | Protocol engine is the safety boundary, not the LLM |
| `ProtocolState` | Agreed | Where one incident sits inside its protocol |
| `ConversationMessage` | Agreed | Transcript only — no audio persisted |
| `ActionRecord` | Agreed | Single list with `ActionStatus` (not separate given/confirmed lists) |
| `Handoff` | Agreed | Must not claim facts that were never established |
| `AuthUser` / `Session` | Agreed | Bystander flow stays anonymous + session-based |
| `ApiResponse` / `ApiError` | Agreed | One envelope for every HTTP response |

## Naming vs DERES spec §14

The written data-model sketch uses shorter names. The TypeScript contracts use the
clearer names below. **These are intentional, not drift:**

| Spec sketch | Shared contract |
|---|---|
| `eventType` | `IncidentEvent.type` |
| `value` | `IncidentEvent.payload` |
| `timestamp` (events/messages) | `occurredAt` / `createdAt` |
| `currentStage` on Incident | `Incident.state.currentStepId` + status |
| flat `emergencyType` on Incident | `Incident.state.emergencyType` |

## Locked design decisions

1. **`EmergencyState.actions`** is one `ActionRecord[]` with `ActionStatus`.  
   Confirmed actions are entries with status `CONFIRMED`.
2. **`Protocol.steps`** is one `ProtocolStep[]` discriminated by `ProtocolStepKind`.
3. **`EmergencyType`** lists all candidate scenarios from the engineering spec.  
   MVP only executes types that have a published protocol (Task 6).
4. **Timestamps are ISO-8601 strings** (`IsoDateTime`), never `Date`, in the shared layer.
5. **IDs are opaque strings** (`Id`) so Mongo ObjectId or UUID both serialize cleanly.

## Frontend helpers added for Melkamu

| Export | Purpose |
|---|---|
| `initialEmergencyState` / `initialIncident` | Same empty object as backend persistence |
| `ConnectionStatus` | Socket / network UI |
| `AsyncStatus` | API client loading/error lifecycle (Task 19) |
| `VoiceSessionPhase` | Voice UI phases (Tasks 20–21) |
| `VoiceTurnRequest` / `VoiceTurnResponse` | `POST .../voice` contract |
| `GetProtocolResponse` | `GET /api/protocols/:id` |

## Change rule

Changing an exported field is an **API change**. Tell the other owner before
merge (git-workflow.md §36). Prefer additive changes over renames during the hackathon.
