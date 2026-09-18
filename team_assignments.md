# ድረስ (DERES) — Individual Assignments

**Compressed 3-week schedule.** All original week labels have been rescaled to fit a 3-week
build (Week 1 = foundation/design, Week 2 = core build/integration, Week 3 = testing,
deployment, and demo). Dependencies and task order are unchanged — only the timing.

This reorganizes `task.md` by person instead of by task number. Each engineering
vertical is owned end to end where practical. Shared tasks are explicitly marked and
must be done together rather than duplicated.

Companion documents: `task.md` (task-numbered master plan),
`git-workflow.md` (branching, review, and merge process).

---

## Obsan — Platform / AI & Safety

System architecture, backend foundation, emergency state, protocol engine, AI
orchestration, Voxide integration, security, and deployment. These sit underneath the
other product verticals, so the foundational work lands first and dependent work branches
from stable interfaces.

### Task 1 — Backend platform scaffold (Week 1)
**Depends on:** nothing.

> Set up the Node.js + Express backend. Create module folders matching the ድረስ (DERES)
> architecture: `incidents`, `protocols`, `ai`, `voice`, `handoff`, `security`,
> plus `common/` and `database/`. Keep module boundaries explicit. Add configuration,
> environment loading, error handling, and a health-check route.

**Verify:** server starts locally; `/api/health` responds; `.env` is gitignored; the
module structure matches the architecture document.

### Task 2 — Database schema v1 (Week 1)
**Depends on:** Task 1.

> Define the initial persistence model for `incidents`, `incident_events`,
> `protocols`, `sessions`, `handoffs`, and any required user/responder records.
> Every incident-scoped record must be traceable to its incident. Add indexes for
> incident lookup and event ordering.

**Verify:** schema/migrations run cleanly; an incident and its events can be persisted
and retrieved in chronological order.

### Task 3 — Shared type contracts (Week 1)
**Shared with:** Melkamu — done together, live, not in parallel.

> Define TypeScript interfaces/schemas for `Incident`, `IncidentEvent`, `EmergencyState`,
> `Protocol`, `ProtocolStep`, `ConversationMessage`, `ActionRecord`, `Handoff`,
> `AuthUser`, and API response/error shapes.

**Verify:** Obsan and Melkamu agree on every shared field before either writes logic
against it; no duplicated incompatible versions are introduced.

### Task 4 — Emergency state engine (Week 1)
**Depends on:** Tasks 1–3.

> Implement the state representation and transition engine. Track known facts,
> unknown facts, uncertainty, emergency context, current protocol, current step,
> actions given, actions confirmed, escalation status, and the incident timeline.
> Reject invalid transitions.

**Verify:** valid transitions work; invalid transitions are rejected; a changed answer
updates state without corrupting the incident history.

### Task 5 — Protocol engine foundation (Week 1)
**Depends on:** Task 4.

> Create the machine-readable protocol structure and execution layer. A protocol
> contains entry conditions, questions, states, actions, contraindications,
> escalation rules, exit conditions, source metadata, and version information.
> The protocol engine—not the LLM—determines what guidance is allowed.

**Verify:** a selected MVP protocol can move from entry → question → action → confirmation
→ next step; an unsupported transition is rejected.

### Task 6 — MVP emergency protocol (Week 1)
**Depends on:** Task 5 and research approval.

> Select one carefully scoped emergency scenario. Convert authoritative first-aid
> guidance into the protocol format. Include source/reference metadata, required
> information, escalation conditions, uncertainty handling, and prohibited actions.

**Verify:** the protocol can be executed without the LLM inventing a procedure;
missing/contradictory information follows an explicit safe path.

### Task 7 — LLM orchestration service (Week 1)
**Depends on:** Tasks 4–6.

> Implement the LLM service for natural-language understanding, structured
> extraction, conversational phrasing, and multilingual interpretation. The model
> must return validated structured output and must not be the authority for medical
> procedures.

**Verify:** natural user statements update structured state correctly; malformed model
output is rejected; unsupported requests do not become invented medical instructions.

### Task 8 — AI safety validation pipeline (Week 2)
**Depends on:** Tasks 4–7.

> Implement the validation chain:
>
> `LLM output → schema validation → state validation → protocol validation → safety rules → response`
>
> Preserve uncertainty and block actions that are not permitted by the current protocol/state.

**Verify:** a deliberately unsafe or unsupported model response is blocked before it
reaches the user.

### Task 9 — Voxide integration (Week 2)
**Depends on:** Task 7.

> Integrate Voxide into the ድረስ (DERES) conversation flow. Support voice input,
> response generation, supported language handling, interruptions/repeats where
> practical, and failure states.

**Verify:** a user can speak naturally, the system processes the input, and a controlled
response is returned through the voice interaction.

### Task 10 — Incident API (Week 2)
**Depends on:** Tasks 2–9.

> Implement the core incident endpoints:
>
> `POST /api/incidents`  
> `GET /api/incidents/:id`  
> `PATCH /api/incidents/:id`  
> `POST /api/incidents/:id/messages`  
> `POST /api/incidents/:id/actions`  
> `GET /api/incidents/:id/timeline`

**Verify:** a complete incident can be created, updated, queried, and reconstructed
from persisted events.

### Task 11 — Handoff service (Week 2)
**Depends on:** Task 10.

> Convert the incident state and timeline into a structured responder handoff containing
> emergency context, location when available, critical known information, observed
> symptoms, questions answered, actions performed, current state, uncertainty, and
> important warnings.

**Verify:** the generated handoff is consistent with the incident record and does not
claim information that was never established.

### Task 12 — Security & session framework (Week 2)
**Depends on:** Task 10.

> Protect responder/admin routes, implement the agreed session/authentication model,
> validate inputs, protect API secrets, and sanitize logs. Keep the anonymous emergency
> flow as simple as the MVP requires.

**Verify:** protected endpoints reject unauthorized requests; secrets are never returned
in API responses or committed to Git.

### Task 13 — Real-time incident infrastructure (Week 2)
**Shared with:** Melkamu.

> Define and implement Socket.IO events for incident creation, state changes, timeline
> events, action records, and handoff updates.

**Verify:** the responder dashboard receives an incident update without requiring a
manual refresh.

### Task 14 — Backend integration pass (Week 3)
**Coordinates:** whole team.

> Replace temporary mocks with real service connections. Confirm the voice,
> AI, state, protocol, incident, handoff, and dashboard layers work together.

**Verify:** the full vertical slice works against real services from voice input to
responder handoff.

### Task 15 — AI/protocol failure testing (Week 3)
**Shared with:** Melkamu.

> Test LLM timeout, malformed output, ambiguous input, contradictory input, unknown
> emergency, unsupported request, protocol mismatch, and interrupted sessions.

**Verify:** every failure has a deterministic safe behavior and does not silently
continue with an invalid state.

### Task 16 — Deployment & production hardening (Week 3)
**Depends on:** integration pass.

> Deploy the backend and database, configure production secrets, CORS, logging,
> health checks, and environment configuration. Investigate EthioDeploy as a
> deployment option.

**Verify:** the deployed API passes health and smoke tests and another teammate can
follow the deployment instructions without asking how to configure it.

### Task 17 — Final technical sign-off (Week 3)
**Coordinates:** whole team.

> Run the final production walkthrough covering voice interaction, protocol execution,
> state tracking, handoff, safety failures, and dashboard integration.

**Verify:** the complete demo path is reproducible from the deployed system.

---

## Melkamu — User Experience Engineering / Responder Dashboard

Frontend application, responder dashboard, API consumption, real-time UI, incident
visualization, and integration testing. Melkamu owns these surfaces end to end while
Obsan owns the underlying AI/state contracts.

### Task 3 — Shared type contracts (Week 1)
**Shared with:** Obsan — done together, live.

> See Obsan's Task 3 above — same task, run once, together.

### Task 18 — Frontend app scaffold (Week 1)
**Depends on:** nothing.

> Set up the React + Vite frontend with the agreed routing, component structure,
> API client, shared types, and application state boundaries. Create placeholder
> routes for the emergency user flow and responder dashboard.

**Verify:** the application builds and each primary route renders without crashing.

### Task 19 — API client & error model (Week 1)
**Depends on:** Task 3 and Task 18.

> Build the typed API client for incidents, messages, actions, timeline, protocols,
> and handoff. Implement consistent loading, error, retry, and connection states.

**Verify:** API calls use the shared contracts and backend errors appear as controlled
UI states rather than uncaught exceptions.

### Task 20 — Emergency interaction UI (Week 1)
**Depends on:** Task 18 and Samuel's approved UX flow.

> Implement the main emergency interface: emergency start, language selection,
> active voice session, current instruction, action confirmation, repeat/clarification,
> and connection state.

**Verify:** a user can navigate the complete emergency flow without needing to
understand the underlying system.

### Task 21 — Voice session frontend integration (Week 2)
**Depends on:** Task 20 and Obsan's Voxide integration.

> Connect the voice UI to the live voice session. Display the correct interaction
> state while listening, processing, speaking, waiting for confirmation, or recovering
> from an error.

**Verify:** voice state shown in the UI matches the actual session state.

### Task 22 — Incident timeline UI (Week 2)
**Depends on:** Tasks 19–21.

> Display conversation events, important answers, actions given, actions confirmed,
> state changes, and escalation events in chronological order.

**Verify:** the timeline matches the backend event order and updates when a new event
is recorded.

### Task 23 — Responder dashboard (Week 2)
**Depends on:** Task 19 and Samuel's dashboard design.

> Build the responder incident list and active incident view. Surface the most
> important information first: emergency context, known critical facts, current
> state, actions already taken, missing information, uncertainty, timeline, and
> handoff.

**Verify:** a responder can understand the incident without replaying the entire
conversation.

### Task 24 — Real-time dashboard updates (Week 2)
**Shared with:** Obsan.

> Connect Socket.IO events to the dashboard and keep active incidents synchronized
> without page refresh.

**Verify:** changing an incident in one session updates the responder view in real time.

### Task 25 — Handoff presentation (Week 2)
**Depends on:** Obsan's Task 11.

> Display the structured handoff in a concise responder-oriented format. Distinguish
> established facts from unknown or uncertain information.

**Verify:** the displayed handoff contains only information supported by the incident.

### Task 26 — Frontend failure handling (Week 2)
**Depends on:** Tasks 20–25.

> Handle microphone failure, voice timeout, API failure, network interruption,
> stale sessions, empty data, and unavailable responder updates.

**Verify:** every major failure produces a usable recovery path or clearly explains
what the user should do next.

### Task 27 — Integration test pass (Week 3)
**Shared with:** Obsan.

> Test the complete frontend/backend vertical slice using real endpoints and real
> state transitions.

**Verify:** no critical demo flow depends on leftover mock data.

### Task 28 — Performance & responsive pass (Week 3)
**Depends on:** integrated MVP.

> Test mobile/desktop layouts, voice-session responsiveness, dashboard rendering,
> loading behavior, and unnecessary network requests.

**Verify:** the core emergency flow remains usable on the target demo devices.

### Task 29 — Final frontend/demo build (Week 3)
**Depends on:** Task 28 and Samuel's final UX review.

> Remove development-only UI, verify production configuration, and prepare the stable
> frontend build used for the hackathon demo.

**Verify:** clean-browser demo works against production without developer tools or
manual database intervention.

---

## Samuel — Emergency UX / Product Design

Samuel owns the human interaction layer, information hierarchy, accessibility,
visual system, and presentation. Designs are created specifically for a stressful
emergency context rather than as a generic dashboard.

### Task 30 — Product flow & emergency UX map (Week 1)
**Depends on:** research/problem definition.

> Map the complete user journey from emergency start through voice interaction,
> guidance, action confirmation, incident timeline, and responder handoff.
> Identify every important user state.

**Verify:** the team can walk through the complete journey using the UX map before
implementation begins.

### Task 31 — Design system & shared UI kit (Week 1)
**Depends on:** Task 30.

> Define typography, spacing, component patterns, status indicators, buttons,
> instruction cards, emergency states, dashboard components, and responsive behavior.

**Verify:** the core screens can be built from shared components without arbitrary
one-off styling.

### Task 32 — Emergency interaction screens (Week 1)
**Depends on:** Task 30–31.

> Design the emergency start, voice interaction, active instruction, confirmation,
> repeat, uncertainty, connection-loss, and failure screens.

**Verify:** each screen answers the question: “What does the user need to know or do
right now?”

### Task 33 — Responder dashboard UX (Week 2)
**Depends on:** Task 31.

> Design the responder incident list, active incident view, critical facts,
> uncertainty/missing information, timeline, and handoff.

**Verify:** critical information has clear visual priority and the dashboard does not
require reading the full conversation to understand the incident.

### Task 34 — Accessibility & stress usability review (Week 2)
**Depends on:** first implemented UI.

> Review text size, contrast, touch targets, visual hierarchy, screen-reader behavior
> where applicable, voice-first interaction, cognitive load, and recovery from errors.

**Verify:** the core flow can be operated with minimal typing and no essential
information depends only on color.

### Task 35 — Multilingual UX review (Week 2)
**Depends on:** multilingual implementation.

> Review Amharic, Afaan Oromo, and English layouts where supported. Check text expansion,
> terminology consistency, readability, and mixed-language edge cases.

**Verify:** translated UI does not break layout or change the intended meaning of
critical instructions.

### Task 36 — Demo/presentation design (Week 3)
**Depends on:** integrated MVP.

> Prepare product screenshots, architecture visuals, user-flow visuals, and presentation
> assets. The presentation should clearly communicate the problem, the bystander-first
> approach, the AI/state/protocol architecture, and the responder handoff.

**Verify:** the demo story can be understood without reading source code.

### Task 37 — Final UX sign-off (Week 3)
**Coordinates:** whole team.

> Review the deployed product from the perspective of a first-time user and a
> responder. Identify only high-value final changes.

**Verify:** no critical UX confusion remains in the final demo flow.

---

# Shared Team Tasks

These tasks belong to all three members and should not be silently assigned to one
person.

### Task 38 — Research & Scholarxiv evidence (Week 1)
**Shared with:** whole team.

> Maintain the research trail supporting the problem, bystander-first approach,
> voice interaction, safe AI/protocol architecture, multilingual emergency
> communication, and relevant competitive analysis.

**Verify:** every major product assumption can be traced to research, an explicit
engineering decision, or a clearly labeled hypothesis.

### Task 39 — Competitive analysis (Week 1)
**Shared with:** whole team.

> Document existing emergency-response, dispatch, first-aid, voice-AI, and Ethiopian
> systems. Identify what ድረስ (DERES) does and does not attempt to replace.

**Verify:** the team can explain the product's differentiation without claiming that
existing platforms do not exist.

### Task 40 — End-to-end vertical slice (Week 2)
**Coordinates:** Obsan + Melkamu + Samuel.

> Demonstrate one complete flow:
>
> `User voice → Voxide → AI interpretation → state → protocol → controlled response → user action → timeline → handoff → responder dashboard`

**Verify:** the flow works with real components rather than disconnected mock screens.

### Task 41 — Safety & failure review (Week 3)
**Shared with:** whole team.

> Review unsafe prompts, unsupported emergencies, ambiguous answers, contradictory
> information, network failure, AI failure, voice failure, and misleading UI states.

**Verify:** the team can demonstrate what ድረስ (DERES) does when it does not know enough
> rather than only demonstrating the happy path.

### Task 42 — UAT & demo rehearsal (Week 3)
**Shared with:** whole team.

> Run the final scenario repeatedly using the deployed product. Record failures,
> assign owners, and fix only issues that affect safety, reliability, or the demo.

**Verify:** the demo can be completed repeatedly without manual backend/database fixes.

---

# Dependency Order

The implementation order is:

```text
Platform scaffold
      ↓
Shared contracts
      ↓
Database + state
      ↓
Protocol
      ↓
LLM
      ↓
Voxide
      ↓
Incident API
      ↓
Frontend voice flow
      ↓
Timeline
      ↓
Handoff
      ↓
Responder dashboard
      ↓
Real-time integration
      ↓
Safety/failure testing
      ↓
Deployment
      ↓
Final UAT
```

---

# Ownership Summary

| Area | Owner | Backup / Contributor |
|---|---|---|
| Backend platform | Obsan | Melkamu |
| Database | Obsan | Melkamu |
| Emergency state | Obsan | Melkamu |
| Protocol engine | Obsan | Melkamu |
| LLM orchestration | Obsan | Melkamu |
| Voxide integration | Obsan | Melkamu |
| Incident API | Obsan | Melkamu |
| Handoff service | Obsan | Melkamu |
| Frontend application | Melkamu | Obsan |
| Emergency UI implementation | Melkamu | Samuel |
| Real-time implementation | Melkamu + Obsan | — |
| Responder dashboard engineering | Melkamu | Obsan |
| Emergency UX | Samuel | Melkamu |
| Design system | Samuel | Melkamu |
| Accessibility | Samuel | Melkamu |
| Presentation visuals | Samuel | All |
| Research | All | — |
| UAT | All | — |
| Deployment | Obsan | Melkamu |

---

# Working Rules

1. **Owner means accountable, not isolated.** Anyone can contribute.
2. **Shared contracts are agreed before dependent implementation begins.**
3. **No one silently changes a shared API, schema, protocol, or event contract.**
4. **Safety-critical code requires review and tests before merge.**
5. **The team integrates early.** Do not wait until the final week to connect voice,
   AI, state, protocol, and UI.
6. **One vertical slice first.** A small working emergency flow is more valuable than
   many disconnected features.
7. **Samuel's UX is part of the product architecture.** Emergency-state design must
   be reviewed before implementation.
8. **Obsan's protocol/state architecture is the safety boundary.** The LLM does not
   become the medical authority.
9. **Every completed task needs evidence:** commit/PR, test, design artifact, or
   documented research result.
10. **Do not manufacture development history.** GitHub history, Scholarxiv evidence,
    and STARK Changelog entries must reflect actual work.

---

# Definition of Done

A task is complete only when:

- Implementation/design is actually finished.
- Acceptance/verification criteria pass.
- Relevant tests or review are completed.
- Dependencies are documented.
- The work is committed and pushed.
- Related documentation is updated.
- Another teammate can understand or use the result.
- Any known limitation is explicitly recorded.

---

# Final Team Principle

> **Three people should build one coherent system, not three separate projects.**

The final repository should make the ownership and development history obvious:

```text
Samuel
  → designs the human emergency interaction

Melkamu
  → turns that interaction into the working product UI and responder experience

Obsan
  → builds the state, protocol, AI, voice, backend, and safety infrastructure

All three
  → integrate, test, research, document, and deliver the final system
```
