# TEAM COD1 — ድረስ (DERES)
## Task Management & Implementation Plan

**Project:** ድረስ (DERES) — AI First Responder  
**Hackathon:** STARK Hackathon 2026  
**Version:** 1.0  
**Status:** Active Engineering Plan

---

## 1. Purpose

This is the master implementation checklist for ድረስ (DERES).

ድረስ (DERES) is a multilingual, voice-first AI first-responder system designed to help an untrained bystander navigate the first critical minutes of an emergency while creating a structured incident record for professional handoff.

**Not:** an ambulance-management system, AI doctor, or unrestricted medical chatbot.

### Core engineering principle

> LLM understands language → Emergency State determines what is known → Protocol Engine determines what can safely be instructed → Voice Response guides the user → User Action updates the state.

## 2. Status & Priority

- `[ ]` Not started
- `[-]` In progress
- `[x]` Completed
- `[!]` Blocked
- `[?]` Needs decision

Priority: **P0** critical MVP/demo; **P1** high; **P2** medium; **P3** future.

---

# 3. Phase 0 — Project Foundation

- [ ] **P0** Create empty GitHub repository.
- [ ] **P0** Add `README.md`, `task.md`, `team_assignments.md`, `git-workflow.md`.
- [ ] **P0** Add `.gitignore` and `.env.example`.
- [ ] **P1** Add `CONTRIBUTING.md`, `LICENSE` and documentation directories.
- [ ] **P1** Configure linting, formatting and development scripts.
- [ ] **P0** Initialize React/Vite frontend.
- [ ] **P0** Initialize Node.js/Express backend.
- [ ] **P0** Establish shared types/constants.
- [ ] **P1** Establish protocol and validation packages.

Recommended structure:

```text
deres/
├── apps/
│   ├── web/
│   └── server/
├── packages/
│   ├── shared/
│   ├── protocols/
│   └── validation/
├── docs/
│   ├── architecture/
│   ├── research/
│   ├── decisions/
│   └── api/
├── scripts/
├── .github/
├── README.md
├── task.md
├── team_assignments.md
└── git-workflow.md
```

# 4. Phase 1 — Research & Product Definition

## Problem validation

- [ ] **P0** Document the bystander-first problem.
- [ ] **P0** Document Ethiopian evidence.
- [ ] **P0** Document why voice matters during emergencies.
- [ ] **P1** Document relevant existing emergency-response systems.
- [ ] **P1** Define target users and emergency contexts.
- [ ] **P1** Document the exact product gap ድረስ (DERES) addresses.

## Competitive research

- [ ] **P0** Research RapidSOS and comparable platforms.
- [ ] **P0** Research Ethiopian emergency/ambulance digital systems.
- [ ] **P1** Research first-aid/first-responder applications.
- [ ] **P1** Research multilingual emergency voice systems.
- [ ] **P1** Record competitors in `docs/research/competitive-analysis.md`.
- [ ] **P1** Record features explicitly excluded from ድረስ (DERES).

## Scholarxiv

- [ ] **P0** Create Scholarxiv ideation space.
- [ ] **P0** Add relevant research papers.
- [ ] **P0** Document ideation and problem evidence.
- [ ] **P1** Explore MCP/Papers API integration.
- [ ] **P1** Link research findings to product decisions.

## Research questions

- [ ] Bystander emergency response behavior.
- [ ] First-aid knowledge gaps.
- [ ] Voice interaction under cognitive load.
- [ ] Multilingual emergency communication.
- [ ] Safe LLM + protocol architectures.
- [ ] Structured emergency-state representation.
- [ ] Conversation-to-handoff transformation.
- [ ] Uncertainty handling.
- [ ] Connectivity limitations.

# 5. Phase 2 — Product & UX

## Core journey

```text
Emergency occurs
      ↓
User starts ድረስ (DERES)
      ↓
Voice interaction
      ↓
Emergency context/state established
      ↓
Critical questions
      ↓
Protocol decision
      ↓
Concise voice guidance
      ↓
User action
      ↓
State/timeline update
      ↓
Structured responder handoff
```

- [ ] **P0** Emergency-start flow.
- [ ] **P0** Voice conversation flow.
- [ ] **P0** Emergency-state UI.
- [ ] **P0** Current instruction/action confirmation.
- [ ] **P0** Incident timeline.
- [ ] **P0** Incident summary.
- [ ] **P0** Responder handoff.
- [ ] **P1** Error/failure states.
- [ ] **P1** Network-loss state.
- [ ] **P1** Language selection.
- [ ] **P1** Accessibility behavior.

# 6. Phase 3 — Emergency Protocol Layer

This is a safety-critical component.

- [ ] **P0** Select one carefully scoped MVP emergency scenario.
- [ ] **P0** Obtain authoritative first-aid guidance.
- [ ] **P0** Convert guidance into structured protocol steps.
- [ ] **P0** Define protocol entry conditions.
- [ ] **P0** Define required questions/information.
- [ ] **P0** Define valid states and transitions.
- [ ] **P0** Define permitted actions.
- [ ] **P0** Define contraindications/prohibited actions.
- [ ] **P0** Define escalation conditions.
- [ ] **P0** Define uncertainty behavior.
- [ ] **P0** Validate every generated instruction against the protocol.
- [ ] **P1** Add protocol versioning.

Conceptual schema:

```text
Protocol
├── id
├── name
├── version
├── source
├── emergencyType
├── entryConditions
├── questions
├── states
├── actions
├── contraindications
├── escalationRules
└── exitConditions
```

# 7. Phase 4 — Emergency State Engine

The state engine prevents ድረስ (DERES) from behaving like a generic chatbot.

Track at minimum:

```text
Incident
├── emergencyType
├── confidence
├── location
├── peopleAffected
├── consciousness
├── breathing
├── knownSymptoms
├── relevantAnswers
├── currentProtocol
├── currentStep
├── actionsGiven
├── actionsConfirmed
├── escalationStatus
├── timeline
└── uncertainty
```

- [ ] **P0** Define incident schema.
- [ ] **P0** Define state transitions.
- [ ] **P0** Implement state creation/update/retrieval.
- [ ] **P0** Implement uncertainty tracking.
- [ ] **P0** Implement action tracking.
- [ ] **P1** Log state transitions.
- [ ] **P1** Validate transitions.
- [ ] **P1** Add replay/debug capability.

## State tests

- [ ] Valid transition.
- [ ] Invalid transition.
- [ ] Missing required field.
- [ ] Conflicting answer.
- [ ] User changes an answer.
- [ ] Protocol step completion.
- [ ] Escalation.
- [ ] Interrupted/recovered session.

# 8. Phase 5 — Voxide Voice Integration

- [ ] **P0** Study Voxide integration requirements.
- [ ] **P0** Create development integration.
- [ ] **P0** Receive/process voice input.
- [ ] **P0** Connect voice to conversation engine.
- [ ] **P0** Produce voice response.
- [ ] **P0** Test supported language(s).
- [ ] **P1** Handle recognition failure.
- [ ] **P1** Handle silence/timeouts.
- [ ] **P1** Support repeat requests.
- [ ] **P1** Measure latency.
- [ ] **P1** Test noisy-environment behavior.

Voice responses should be short, action-oriented and one critical question at a time.

# 9. Phase 6 — LLM Orchestration

The LLM is a component, not the safety authority.

### LLM may

- Understand natural language.
- Extract structured information.
- Interpret emergency context.
- Generate conversational phrasing.
- Handle multilingual understanding.
- Ask for missing information under system rules.

### LLM must not

- Freely invent emergency procedures.
- Override protocol constraints.
- Hide uncertainty.
- Diagnose users as a substitute for professional care.

Tasks:

- [ ] **P0** Select LLM provider.
- [ ] **P0** Define system prompt.
- [ ] **P0** Define structured output schema.
- [ ] **P0** Implement LLM service.
- [ ] **P0** Validate outputs.
- [ ] **P0** Implement state-aware prompting.
- [ ] **P0** Implement protocol-aware prompting.
- [ ] **P0** Reject malformed/unsafe output.
- [ ] **P1** Add retry/fallback behavior.
- [ ] **P1** Track latency/failures.
- [ ] **P1** Build an evaluation dataset.

# 10. Phase 7 — AI Safety Pipeline

```text
Voice Input
   ↓
Speech Understanding
   ↓
LLM Interpretation
   ↓
Structured Output Validation
   ↓
Emergency State Validation
   ↓
Protocol Validation
   ↓
Safety Rules
   ↓
Response Generation
   ↓
Voice Output
```

- [ ] **P0** Define safety rules.
- [ ] **P0** Validate every AI action against current state.
- [ ] **P0** Validate every instruction against protocol.
- [ ] **P0** Block unsupported actions.
- [ ] **P0** Preserve uncertainty.
- [ ] **P0** Escalate when required.
- [ ] **P1** Add audit trail.
- [ ] **P1** Add safety test suite.

# 11. Phase 8 — Backend

- [ ] **P0** Express server foundation.
- [ ] **P0** Environment configuration.
- [ ] **P0** Database connection.
- [ ] **P0** Incident service.
- [ ] **P0** Protocol service.
- [ ] **P0** AI orchestration service.
- [ ] **P0** Voice integration service.
- [ ] **P0** Handoff service.
- [ ] **P1** Authentication/RBAC if required.
- [ ] **P1** Audit service.

Suggested endpoints:

```text
POST   /api/incidents
GET    /api/incidents/:id
PATCH  /api/incidents/:id
POST   /api/incidents/:id/messages
POST   /api/incidents/:id/actions
GET    /api/incidents/:id/timeline
GET    /api/incidents/:id/handoff
POST   /api/ai/interpret
POST   /api/voice/session
GET    /api/protocols
GET    /api/health
```

- [ ] **P0** Define API contracts before integration.
- [ ] **P0** Implement incident endpoints.
- [ ] **P0** Implement conversation/action endpoints.
- [ ] **P0** Implement handoff endpoint.
- [ ] **P0** Implement health endpoint.
- [ ] **P1** Add request validation, documentation and rate limiting.

# 12. Phase 9 — Database

Recommended MVP data:

```text
incidents
incident_events
protocols
sessions
handoffs
audit_logs
users   (only if required)
```

- [ ] **P0** Design schema.
- [ ] **P0** Persist incidents.
- [ ] **P0** Persist incident events.
- [ ] **P0** Persist/load protocol data.
- [ ] **P0** Persist handoffs.
- [ ] **P1** Add audit logs/indexes.
- [ ] **P1** Define retention strategy.

# 13. Phase 10 — Real-Time Communication

- [ ] **P0** Establish Socket.IO.
- [ ] **P0** Create incident rooms/sessions.
- [ ] **P0** Broadcast state updates.
- [ ] **P0** Broadcast timeline events.
- [ ] **P1** Broadcast responder updates.
- [ ] **P1** Handle reconnects, duplicates and stale sessions.

Suggested events:

```text
incident.created
incident.updated
incident.state_changed
incident.message_added
incident.action_recorded
incident.handoff_updated
incident.closed
```

# 14. Phase 11 — Frontend

## User screens

- [ ] **P0** Landing/emergency start.
- [ ] **P0** Language selection.
- [ ] **P0** Voice interaction.
- [ ] **P0** Active emergency state.
- [ ] **P0** Current instruction.
- [ ] **P0** Action confirmation.
- [ ] **P0** Incident timeline.
- [ ] **P0** Incident summary.
- [ ] **P1** Error/connection states.

## Responder dashboard

- [ ] **P0** Incident list.
- [ ] **P0** Active incident.
- [ ] **P0** Emergency summary.
- [ ] **P0** Current known state.
- [ ] **P0** Missing/uncertain information.
- [ ] **P0** Actions already performed.
- [ ] **P0** Timeline.
- [ ] **P0** Handoff view.
- [ ] **P1** Real-time updates and filtering.

# 15. Phase 12 — Handoff System

Convert a messy voice conversation into a concise structured incident summary.

```text
Incident ID
Emergency type
Approximate location
Time started
People affected
Known critical information
Observed symptoms
Questions answered
Actions already taken
Current protocol step
Current status
Uncertainty
Important warnings
Conversation timeline
```

- [ ] **P0** Define handoff schema.
- [ ] **P0** Generate structured handoff.
- [ ] **P0** Validate handoff.
- [ ] **P0** Display handoff in responder dashboard.
- [ ] **P1** Generate concise human-readable summary.
- [ ] **P1** Track handoff updates.

# 16. Phase 13 — Multilingual Support

Initial target: English, Amharic, Afaan Oromo, subject to actual Voxide support and quality.

- [ ] **P0** Verify Voxide language capabilities.
- [ ] **P0** Define language architecture.
- [ ] **P0** Implement language selection.
- [ ] **P0** Test one language end-to-end.
- [ ] **P1** Add second language.
- [ ] **P1** Add third language if stable.
- [ ] **P1** Test emergency terminology, language switching and mixed-language input.

Do not trade safety/reliability for language count.

# 17. Phase 14 — Security

- [ ] **P0** Define anonymous/session-based incident model if suitable.
- [ ] **P0** Protect responder/admin routes.
- [ ] **P0** Validate incoming data.
- [ ] **P0** Protect secrets.
- [ ] **P0** Never commit `.env`.
- [ ] **P0** Sanitize logs.
- [ ] **P1** Add authentication/authorization if needed.
- [ ] **P1** Add audit logging.
- [ ] **P1** Review data exposure and retention.

# 18. Phase 15 — Testing

## Unit

- [ ] Protocol parser/validation.
- [ ] State transitions.
- [ ] Incident service.
- [ ] Handoff generation.
- [ ] AI output validation.
- [ ] Safety rules.

## Integration

- [ ] Voice → AI.
- [ ] AI → state.
- [ ] State → protocol.
- [ ] Protocol → response.
- [ ] Incident → timeline.
- [ ] Incident → handoff.
- [ ] Frontend → backend.
- [ ] Backend → database.

## End-to-end

- [ ] Start emergency.
- [ ] Speak naturally.
- [ ] Establish context.
- [ ] Ask required questions.
- [ ] Give controlled instruction.
- [ ] Confirm action.
- [ ] Update state/timeline.
- [ ] Generate handoff.
- [ ] Display incident to responder.

## Failure tests

- [ ] Microphone unavailable.
- [ ] Speech recognition failure.
- [ ] LLM timeout.
- [ ] Malformed model response.
- [ ] Network interruption.
- [ ] Database failure.
- [ ] Unknown emergency.
- [ ] Ambiguous statement.
- [ ] Contradictory information.
- [ ] Unsupported request.

# 19. Phase 16 — Observability

Track:

- [ ] Request latency.
- [ ] Voice latency.
- [ ] LLM latency.
- [ ] Error rates.
- [ ] Protocol validation failures.
- [ ] State transition failures.
- [ ] Session interruptions.
- [ ] AI validation failures.

Never log unnecessary sensitive conversation content.

# 20. Phase 17 — Deployment

- [ ] **P0** Deploy frontend.
- [ ] **P0** Deploy backend.
- [ ] **P0** Configure production environment/secrets.
- [ ] **P0** Configure database/CORS.
- [ ] **P0** Verify production voice flow.
- [ ] **P1** Investigate EthioDeploy.
- [ ] **P1** Document deployment decision.

# 21. Phase 18 — CI/CD

- [ ] **P1** GitHub Actions.
- [ ] **P1** Install dependencies.
- [ ] **P1** Lint.
- [ ] **P1** Test.
- [ ] **P1** Build.
- [ ] **P1** Block merges when checks fail.
- [ ] **P1** Configure deployment workflow if appropriate.

# 22. Phase 19 — Demo Engineering

Use one strong story, not a feature dump.

- [ ] Select one emergency scenario.
- [ ] Prepare controlled demo script.
- [ ] Start in supported language.
- [ ] Demonstrate voice interaction.
- [ ] Demonstrate emergency state.
- [ ] Demonstrate protocol-controlled guidance.
- [ ] Demonstrate action confirmation.
- [ ] Demonstrate live timeline.
- [ ] Demonstrate responder handoff.
- [ ] Demonstrate multilingual support if stable.
- [ ] Demonstrate uncertainty/safety behavior.
- [ ] Prepare backup/mock mode for external-service failure.
- [ ] Test clean browser, microphone and production deployment.
- [ ] Prepare backup video/screenshots.

# 23. Phase 20 — Documentation

- [ ] README.
- [ ] Architecture overview.
- [ ] Setup guide.
- [ ] Environment variables.
- [ ] API contracts.
- [ ] Database model.
- [ ] Protocol format.
- [ ] AI architecture.
- [ ] Safety architecture.
- [ ] Research/competitive analysis.
- [ ] ADRs.
- [ ] Demo instructions.
- [ ] Deployment guide.

# 24. MVP Definition

MVP requires all of these to work together:

- [ ] Voxide voice interaction.
- [ ] Natural voice conversation.
- [ ] One carefully scoped emergency protocol.
- [ ] Emergency state engine.
- [ ] LLM interpretation.
- [ ] Controlled protocol layer.
- [ ] Incident timeline.
- [ ] Structured responder handoff.
- [ ] Basic responder dashboard.
- [ ] At least one stable supported language end-to-end.
- [ ] Deployed working prototype.
- [ ] Safety/failure handling.
- [ ] Documented research basis.

# 25. Explicitly Out of MVP

Do not allow scope creep into:

- Ambulance fleet management.
- Hospital management.
- Full electronic medical records.
- AI diagnosis.
- Nationwide dispatch.
- Payment system.
- Complex user profiles.
- Full offline LLM.
- Large-scale hospital integrations.
- Hardware development.
- Unrestricted medical chatbot.

# 26. Definition of Done

A task is complete only when:

1. Code/design/documentation is committed.
2. Relevant tests pass.
3. Another teammate can understand/use it.
4. No secrets are committed.
5. Related documentation is updated.
6. The feature works in the agreed environment.
7. Required STARK tracking/changelog evidence is updated.

# 27. Daily Team Checklist

### Yesterday
- What did I complete?

### Today
- What am I implementing?

### Blockers
- What is preventing progress?

### Integration
- What does another teammate need from me?

### Evidence
- What commit/PR demonstrates the work?

# 28. Priority Rule

```text
Safety
  ↓
Core Voice Interaction
  ↓
Emergency State
  ↓
Protocol Engine
  ↓
Handoff
  ↓
Responder Dashboard
  ↓
Multilingual Expansion
  ↓
Polish
  ↓
Nice-to-have Features
```

# 29. Decision Gates

## Gate 1 — Concept
- [ ] Problem validated.
- [ ] Competitor research complete.
- [ ] MVP scope approved.

## Gate 2 — Architecture
- [ ] Architecture approved.
- [ ] Protocol approach approved.
- [ ] State model approved.
- [ ] Voice integration approach approved.

## Gate 3 — Vertical Slice
- [ ] Voice input works.
- [ ] LLM understands input.
- [ ] Protocol produces controlled response.
- [ ] Voice response works.

## Gate 4 — Integrated MVP
- [ ] Incident state works.
- [ ] Timeline works.
- [ ] Handoff works.
- [ ] Dashboard works.

## Gate 5 — Demo Ready
- [ ] Production deployment works.
- [ ] Demo scenario is stable.
- [ ] Failure fallback exists.
- [ ] Documentation is complete.

# 30. Final Product Principle

> Build the smallest system that convincingly proves the core thesis: an ordinary person can use their voice to receive structured, protocol-controlled emergency guidance while the system turns the interaction into useful information for professional responders.
