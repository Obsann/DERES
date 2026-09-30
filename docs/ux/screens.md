# ድረስ (DERES) — Screen Specifications

**Tasks:** 32 (Emergency interaction screens) and 33 (Responder dashboard UX)
**Flow and states:** [`emergency-ux-map.md`](./emergency-ux-map.md)
**Components:** [`design-system.md`](./design-system.md)

Wireframes are layout, not pixels; build them from the UI kit. Each screen lists the
data it reads so the implementation can be checked against the shared contracts.

---

## Emergency screens (bystander, mobile first)

Layout: `d-emergency-layout`. The instruction sits at the top and controls at the
bottom within thumb reach. No global navigation during an active emergency.

### E1 · Start — `/`

```text
┌───────────────────────────────┐
│ ድረስ DERES                     │
│                               │
│ Someone needs help?           │  text-display
│ I'll guide you step by step,  │
│ by voice.                     │
│                               │
│ ┌───────────────────────────┐ │
│ │   ⚠  START EMERGENCY      │ │  Button emergency xl block
│ └───────────────────────────┘ │
│ English · Change language     │  quiet
│                               │
│ Responder login               │  quiet, bottom
└───────────────────────────────┘
```

- Press → if a language is remembered go to E3, else E2.
- Reads: `EmergencySession.language`.

### E2 · Language — `/emergency/language`

```text
┌───────────────────────────────┐
│ Choose your language          │
│ ┌───────────────────────────┐ │
│ │ English                   │ │  Button primary lg block
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ አማርኛ        Coming soon   │ │  disabled until protocol supports it
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Afaan Oromoo  Coming soon │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

- Enabled languages = `protocol.languages` from `GET /api/protocols`.
- Each label is in its own script with a `lang` attribute.

### E3 · Active emergency — `/emergency/session`

```text
┌───────────────────────────────┐
│ [Help recommended] [Connected]│  d-status-strip: EscalationBadge, ConnectionBadge
│ ┌───────────────────────────┐ │
│ │ ✓ DO THIS NOW      STEP 2 │ │  InstructionCard kind=action
│ │ Call emergency services   │ │
│ │ now. Put the phone on     │ │
│ │ speaker if you can.       │ │
│ │ ┌───────────────────────┐ │ │
│ │ │ ☎ Call emergency svcs │ │ │  ButtonLink emergency (only on call step
│ │ └───────────────────────┘ │ │     and whenever escalation ≠ none)
│ │ ┌───────────────────────┐ │ │
│ │ │ ✓ Done                │ │ │  Button primary lg
│ │ └───────────────────────┘ │ │
│ │ [ ✕ I can't ] [ ⟲ Repeat ]│ │  Button secondary lg
│ └───────────────────────────┘ │
│                               │
│            ( 🎤 )             │  VoicePhaseIndicator
│   Say "done" when finished    │
│                               │
│ Timeline ›                    │  quiet link
└───────────────────────────────┘
```

Variants by step kind:

| Kind | Card controls |
|---|---|
| `question` | Yes · No · Not sure (primary, primary, secondary) |
| `action` | Done · I can't · Repeat |
| `escalation` | Call emergency services (emergency) |
| `exit` | Help has arrived (secondary) |

- Reads: `VoiceTurnResponse.{phase, reply, failure, source}`, current protocol step
  (`kind`, `label`, `requiresConfirmation`), `incident.state.escalationStatus`,
  `ConnectionStatus`.
- Buttons send the same answer the voice path would (`POST /api/incidents/:id/voice`
  with a transcript, or `POST /api/incidents/:id/actions` with `ActionStatus`).
- Step counter shows completed step count + 1, not "of N": the protocol branches, so
  a total would be misleading.

### E3 failure overlays

Rendered as a `Banner` directly above the instruction card; the card stays visible.

| Case | Banner |
|---|---|
| Mic denied | warning · "We can't hear you." · action: Allow microphone |
| Not understood | info · "Sorry, I didn't catch that." |
| Silence / timeout | info · "Are you still there?" |
| Voice / AI unavailable | warning · "Voice help is having trouble. Follow the steps on screen." |
| Offline | warning · "Connection lost — reconnecting. Keep following the last instruction." |
| Unsupported emergency | Replace card with `kind=escalation` card: "I can only guide you for someone who has collapsed. Call emergency services now." |
| Child / infant | Replace card with the protocol's `escalate-child` instruction |

### E4 · Timeline — `/emergency/:id/timeline`

Simple chronological list of key events (questions answered, actions done,
escalation) in plain words. Back button returns to E3. No raw event types.

### E5 · Summary — `/emergency/:id/summary`

```text
┌───────────────────────────────┐
│ ✓ Help has arrived.           │  Banner success
│   Show this to the responder. │
│ [ Show to responder ]         │  enlarges text, hides chrome
│                               │
│ CRITICAL FACTS                │  Panel + FactList
│ Responsive  Not responding  ✓ │
│ Breathing   Not normal      ? │
│ UNKNOWN OR UNCERTAIN          │  Panel uncertain
│ ACTIONS TAKEN                 │
└───────────────────────────────┘
```

- Reads: `GET /api/incidents/:id/handoff`.

---

## Responder dashboard (desktop first, works on tablet)

Layout: `d-dashboard-layout`. Dense but calm; the same kit at `size="md"`.

### R1 · Incident list — `/responder`

```text
┌────────────────────────────────────────────────────────────────────┐
│ Active incidents (3)                          [Connected]          │
├──────────┬──────────────────┬─────────────┬───────────┬────────────┤
│ Status   │ Emergency        │ Escalation  │ Started   │ Location   │
├──────────┼──────────────────┼─────────────┼───────────┼────────────┤
│[Escalated]│ Unresponsive adult│[Escalated] │ 4 min ago │ Bole, near…│
│ [Active] │ Unresponsive adult│[Recommended]│ 1 min ago │ Unknown    │
└──────────┴──────────────────┴─────────────┴───────────┴────────────┘
```

- Sort: escalated first, then most recent.
- Whole row is the link to R2. New rows highlight briefly (no sound).
- Missing location reads **"Location unknown"**, never blank.
- Empty state: "No active incidents. New incidents appear here automatically."
- Reads: `GET /api/incidents`, Socket.IO `incident.created` / `incident.updated`.

### R2 · Active incident — `/responder/incidents/:id`

```text
┌────────────────────────────────────────────────────────────────────┐
│ Unresponsive adult   [Escalated] [Active]     started 08:01 · 6 min│
├──────────────────────────────────────┬─────────────────────────────┤
│ WARNINGS (critical panel)            │ CURRENT STATE               │
│ ⚠ Unresponsive, not breathing normally│ Consciousness  Unresponsive │
├──────────────────────────────────────┤ Breathing      Abnormal  ?  │
│ CRITICAL FACTS                       │ Age group      Unknown      │
│ label        value          certainty│ Step           Chest compr. │
│ …                                    ├─────────────────────────────┤
├──────────────────────────────────────┤ ACTIONS TAKEN               │
│ UNKNOWN OR UNCERTAIN (dashed panel)  │ Call EMS       [Done] 08:02 │
│ • Breathing — two different answers  │ Open airway    [Done] 08:03 │
│ • Age group — never asked            │ Compressions   [Given]      │
├──────────────────────────────────────┴─────────────────────────────┤
│ TIMELINE (key events)                        Show full conversation│
└────────────────────────────────────────────────────────────────────┘
```

- Reading order equals priority: warnings → critical facts → unknowns → state →
  actions → timeline. On narrow screens the right column stacks below the left.
- The unknowns panel is always rendered; when empty it says "Nothing flagged".
- Every fact shows a `CertaintyBadge`.
- Reads: `GET /api/incidents/:id/handoff` (warnings, facts, uncertainty, actions),
  `GET /api/incidents/:id/timeline`, Socket.IO `incident.updated`,
  `incident.handoff_updated`.

### R3 · Handoff view

Same content as R2 without the timeline, formatted for reading aloud or printing.
Shows `handoff.version` and `generatedAt` so a responder knows how fresh it is.

---

## Acceptance checks

- Each emergency screen answers "What do I need to know or do right now?" in its
  first visible line.
- No screen conveys state by color alone.
- The session screen is fully usable without the microphone.
- A responder can state the patient's condition, what is unknown and what has been
  done from R2 without opening the full conversation.
