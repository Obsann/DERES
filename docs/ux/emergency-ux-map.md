# ድረስ (DERES) — Emergency UX Map

**Task:** 30 (Product flow & emergency UX map)
**Status:** Draft for team walkthrough
**Inputs:** engineering specification §6–7, §12, §20–22; `packages/protocols/src/unconsciousAdult.ts`;
`packages/shared` enums (`VoiceSessionPhase`, `Certainty`, `ActionStatus`, `ConnectionStatus`).

This map lists every state a bystander or responder can be in, what the screen must
say in that state, and which backend value drives it. Screen layouts are in
[`screens.md`](./screens.md); components are in [`design-system.md`](./design-system.md).

## 1. Who we design for

| User | Situation | Consequence for the UI |
|---|---|---|
| Bystander | Stressed, possibly shaking, hands busy with the patient, phone on the ground or on speaker, may read poorly or not at all, may be outside in sunlight. | Voice first. One instruction on screen at a time. Huge text and targets. Everything important is also spoken. No typing. |
| Responder | Receiving or arriving at an incident, needs the picture in seconds. | Critical facts first, uncertainty impossible to miss, the full conversation last. |

**One rule governs every emergency screen:** it answers *"What do I need to know or do
right now?"* and nothing else.

## 2. Bystander journey

```text
 ┌──────────┐   ┌──────────┐   ┌─────────────────────────────────────────────┐   ┌──────────┐
 │ 1 Start  │──▶│ 2 Language│──▶│ 3 Active emergency (voice loop)             │──▶│ 5 Summary│
 │  (home)  │   │ (1 tap)  │   │   question → answer → action → confirm → …  │   │ + handoff│
 └──────────┘   └──────────┘   │                                             │   └──────────┘
      │                        │   4 Failure overlays (any time)             │
      └── language remembered ─┴─▶ mic / network / not understood / unknown  │
                                 └─────────────────────────────────────────────┘
```

### Step 1 — Start (`/`)

- **User needs to know:** this app gives guided first-aid help by voice.
- **User needs to do:** press one button.
- One dominant **Start emergency** button. No login, no account, no form
  (anonymous session, ADR 0007).
- If a language was chosen before, it is reused and step 2 is skipped. A small
  "Change language" link remains.
- Secondary, visually quiet: "Responder login" link.

### Step 2 — Language (`/emergency/language`)

- Three large buttons, each labelled **in its own language and script**:
  `English`, `አማርኛ`, `Afaan Oromoo`.
- Only languages the protocol actually supports are enabled (`protocol.languages`;
  English, Amharic and Afaan Oromoo). Others show "Coming soon" rather than
  silently falling back.
- One tap proceeds; no "Next" button.

### Step 3 — Active emergency (`/emergency/session`)

On entering: create session → create incident → request microphone → open the
first voice turn. The first spoken line is the opening reassurance plus the first
protocol question.

The voice loop follows the **protocol step kind**:

| Protocol step kind | Screen shows | User answers with | Fallback buttons |
|---|---|---|---|
| `question` (e.g. *Are they responding?*) | The question, large | Voice | **Yes** · **No** · **Not sure** |
| `action` with `requiresConfirmation` (e.g. *Call emergency services now*) | The instruction, large, with a step counter | Voice ("done") | **Done** · **I can't** · **Repeat** |
| `escalation` | Red banner + instruction | — | **Call emergency services** (tel link) |
| `exit` (e.g. *Keep pushing until help takes over*) | Persistent instruction, calm | — | **Help has arrived** |

- **Not sure** is always offered on questions. The protocol treats an unknown
  answer as the safer path (e.g. unknown breathing ⇒ chest compressions), so the
  UI must never force a yes/no.
- **I can't** records `ActionStatus.UNABLE` and lets the protocol move on; it must
  never block the flow or read as failure.
- **Repeat** replays the last spoken line without sending a turn.

#### Voice phase (from `VoiceTurnResponse.phase`)

Always shown as **icon + word**, never color alone.

| `VoiceSessionPhase` | Label | What the user should do |
|---|---|---|
| `idle` | "Tap to speak" | Tap the mic |
| `listening` | "Listening — speak now" | Talk |
| `processing` | "Thinking…" | Wait (show within 300 ms, no spinner bigger than the label) |
| `speaking` | "Speaking" | Listen; tapping the mic interrupts |
| `awaiting_confirmation` | "Say *done* when finished" | Do the action, confirm |
| `error` | See §3 | Follow recovery |

#### Always visible during step 3

1. The current instruction or question (top, largest text).
2. The voice phase indicator + mic button (bottom, thumb reach).
3. A slim status strip: escalation state and connection state.
4. **Call emergency services** — reachable in one tap from every screen once the
   person is unresponsive (`escalationStatus` ≠ `none`).

Hidden by default, one tap away: the timeline (`/emergency/:id/timeline`).

### Step 5 — Summary (`/emergency/:id/summary`)

- Shown when the protocol reaches an `exit` step and help has arrived, or the user
  ends the session.
- Leads with: "Show this to the responder." Then the handoff facts, in the
  responder's order (§4).
- Large **Show to responder** mode: hides chrome, maximises text.

## 3. Failure states

Every failure has exactly one next action. Failures are overlays on step 3 so
the current instruction stays visible behind them whenever it is still valid.

| Trigger (backend value) | User sees | Spoken | Next action |
|---|---|---|---|
| Mic permission denied / no mic | "We can't hear you. You can still use the buttons." | — | Buttons stay; link to enable mic |
| `failure: 'recognition'` | "Sorry, I didn't catch that." | Same, then the question again | Speak again or use buttons |
| `failure: 'silence'` / `'timeout'` | "Are you still there?" | Same | Tap mic / any button |
| `failure: 'upstream'` / `UPSTREAM_UNAVAILABLE` | "Voice help is having trouble. Follow the steps on screen." | — | Buttons-only mode keeps the protocol running |
| `ConnectionStatus.disconnected` / `reconnecting` | Amber strip: "Connection lost — reconnecting. Keep following the last instruction." | — | Last instruction stays; auto-retry |
| `emergencyType: unknown` / unsupported emergency | "Call emergency services now. Tell them what happened and where you are." | Same | **Call emergency services** |
| `SAFETY_BLOCK` event / `AI_VALIDATION_FAILED` | Nothing new; the last safe instruction stays | Fixed safe phrase (`source: 'safe_fallback'`) | Continue |
| Contradictory answer (`Certainty.UNCERTAIN`) | Question is asked again, calmly | "Let's check again…" | Answer again or **Not sure** |
| Child or infant mentioned (`escalate-child`) | Red banner: "This guidance is for adults. Call emergency services and follow their instructions." | Same | **Call emergency services** |

Rules:

- Never show a stack trace, error code or request id to the bystander.
- Never show a blank screen; the last valid instruction is the fallback content.
- No failure may silently advance the protocol.

## 4. Responder journey

```text
 ┌──────────────┐    ┌──────────────────────────┐    ┌───────────────┐
 │ Incident list│──▶ │ Active incident           │──▶ │ Handoff view  │
 │ (live)       │    │ critical → state → gaps → │    │ (print / show)│
 └──────────────┘    │ actions → timeline        │    └───────────────┘
                     └──────────────────────────┘
```

### Incident list (`/responder`)

Each row: emergency type, status, escalation, time since start, location (or
"Location unknown"), current step. Escalated incidents sort first. New incidents
appear live (Socket.IO `incident.created`) with a brief highlight, not a sound.

### Active incident (`/responder/incidents/:id`)

Reading order, top to bottom, matching the responder's questions:

1. **Warnings** (`handoff.warnings`, critical first).
2. **Critical facts** (`handoff.criticalInformation`), each with its certainty.
3. **Current state:** consciousness, breathing, age group, current protocol step.
4. **Unknown / uncertain** (`handoff.uncertainty`) — its own block, never merged
   into facts, never hidden when empty ("Nothing flagged").
5. **Actions taken** with status and time.
6. **Timeline** (`incident_events` by `sequence`), collapsed to key events with
   "Show full conversation".

Certainty is shown as a word next to each value: **Known**, **Uncertain**,
**Unknown**. A fact without a certainty label is a bug.

## 5. State coverage checklist

Use this during the walkthrough; every row needs a screen answer.

- [ ] First launch, no language chosen
- [ ] Returning user, language remembered
- [ ] Mic granted / denied / unavailable
- [ ] Each voice phase (6)
- [ ] Question step — yes / no / not sure / unrecognised
- [ ] Action step — done / can't / repeat / silence
- [ ] Escalation recommended vs. escalated
- [ ] Exit step reached (3 exits in the MVP protocol)
- [ ] Unsupported emergency
- [ ] Child / infant
- [ ] Contradictory answer
- [ ] Safety block (fallback phrase)
- [ ] Network lost mid-instruction, recovered
- [ ] LLM / Voxide unavailable → buttons-only mode
- [ ] Summary shown to responder
- [ ] Responder: empty list, live new incident, incident with no location, incident with only unknowns

## 6. Decisions

1. **Emergency number — 907 (ambulance).** Verified against the Ethiopian Red Cross
   and the French Embassy in Ethiopia (fire 939, police 991; there is no unified
   112/911). Set in `apps/web/src/config/emergency.ts`, overridable with
   `VITE_EMERGENCY_NUMBER` for regions outside Addis Ababa.
2. **Amharic and Afaan Oromoo are enabled.** Protocol prompts and fixed phrases
   exist in all three languages. The drafts need native-speaker sign-off before
   the demo: [`translation-review.md`](./translation-review.md).
3. **Location — ask the browser once when the incident opens.** `useIncidentLocation`
   requests it automatically and never blocks the flow. If it is denied, the
   location can still be described by voice, and the server merges the spoken
   description with any coordinates.
