**TEAM COD1**

ድረስ (DERES) --- AI FIRST RESPONDER

**Full Engineering & Product Specification**

STARK Hackathon 2026

*Proposed Engineering Direction • Version 1.0 • Research-backed concept*

# 1. Executive Summary

ድረስ (DERES) is a voice-first AI first-responder platform designed to help
an untrained person handle the first critical minutes of an emergency
while professional help is being arranged or is still on the way. The
platform is not intended to replace ambulance services, emergency
professionals, doctors, or established emergency-dispatch systems. Its
primary user is the person already at the emergency scene.

ድረስ (DERES) uses conversational voice interaction to understand what is
happening, determine the immediate emergency context, ask the most
important questions in the correct order, provide concise controlled
first-response instructions, maintain incident state, record
observations and actions, and prepare structured information for
professional handoff.

Core philosophy: Don\'t just tell the user information. Guide the user
through the situation.

# 2. Problem Definition

Emergency systems generally focus on getting professional assistance to
the person who needs it. However, there is a period between an emergency
occurring and professional help arriving. During that period, somebody
is already present: a family member, friend, neighbor, passerby,
teacher, security worker, coworker, driver, or other bystander.

That person may have little or no first-aid training. The problem is
therefore not only "How do we get professional help there?" but also
"What does the person already there do safely during the first critical
minutes?"

# 3. Research Basis

Research into trauma care in Addis Ababa has reported that relatives and
bystanders frequently provide prehospital care. One study reported
relatives at 45%, bystanders at 33.9%, and trained ambulance staff at
17.4%. Lack of knowledge was the largest reported reason for not
providing care (61.2%).

Ethiopia's emergency ecosystem is also developing coordinated digital
infrastructure, including HEARTS through the Ethiopian Ambulance
Alliance Network. International platforms such as RapidSOS already
address emergency communication, transcription, translation, incident
information, and professional dispatcher assistance. Therefore ድረስ (DERES)
should not rebuild those systems. Its target gap is AI assistance for
the untrained person at the scene.

# 4. Product Vision

Vision: Build a multilingual emergency assistant that can turn a
frightened, uncertain bystander into a guided first responder.

Mission: Provide immediate, understandable, voice-based guidance while
maintaining a structured picture of the emergency that can be
transferred to professional responders.

Product principle:\
Voice is the interface.\
AI is the reasoning layer.\
Protocols are the safety layer.\
Incident state is the memory.\
Responder handoff is the bridge.

# 5. What ድረስ (DERES) Is NOT

• An AI doctor or diagnostic system.\
• A generic AI chatbot.\
• An ambulance-dispatch replacement.\
• An ambulance-tracking platform.\
• A generic SOS button.\
• An autonomous medical decision-maker.

The system should operate within explicitly defined protocols and
escalation rules.

# 6. Target Users

Primary user: the bystander / first person at the scene. The user may be
stressed, have both hands occupied, be uncomfortable reading, or
communicate better through speech.

Secondary user: emergency responder, who receives structured information
generated from the interaction.

Potential future users include schools, workplaces, security
organizations, transportation companies, community organizations, event
organizers, and humanitarian organizations.

# 7. Core User Journey

1\. Emergency begins --- user activates ድረስ (DERES) and speaks naturally.\
2. Situation establishment --- AI extracts initial context.\
3. Prioritization --- system asks the highest-priority question first.\
4. User response --- incident state changes.\
5. Next critical question --- system follows the protocol.\
6. Guided action --- concise protocol-based instruction is provided.\
7. State tracking --- observations and actions are maintained as
incident state.\
8. Handoff --- a structured responder summary is generated.

Interaction pattern: Question → Answer → Action → Confirmation → Next
step.

# 8. Core Product Architecture

USER → VOXIDE VOICE → CONVERSATION ENGINE → EMERGENCY STATE ENGINE →
PROTOCOL / SAFETY ENGINE → INCIDENT RECORD + HANDOFF ENGINE → RESPONDER
DASHBOARD

The architecture intentionally separates language understanding from
emergency state, protocol decisions, and responder information.

# 9. Major System Components

Voice Layer --- Voxide provides speech input/output and multilingual
interaction.

Conversation Engine --- interprets natural speech, extracts relevant
facts, identifies missing information, and maintains conversational
context.

Emergency State Engine --- maintains structured incident state such as
emergency type, consciousness, breathing, current stage, and escalation
state.

Protocol Engine --- defines what the system is allowed to recommend for
each supported scenario. It is the safety boundary around the LLM.

LLM Layer --- handles natural-language understanding, structured
extraction, context, and natural phrasing. It is not treated as the
medical authority.

Incident Timeline --- records meaningful events and state changes.

Handoff Engine --- converts conversational information into a concise
structured responder summary.

Responder Dashboard --- displays active incidents, timelines, patient
state, and handoff information. For the hackathon this can be simulated.

# 10. Emergency Scenario Strategy

The MVP should not attempt to support every emergency. Candidate
scenarios for research include unconscious/collapsed person, severe
bleeding, choking, burns, possible stroke, seizure, and severe allergic
reaction. Final scenarios must be selected after reviewing authoritative
first-aid protocols and evaluating what can be safely implemented during
the hackathon.

# 11. Protocol-First Architecture

The model should not invent emergency procedures.

User speech → LLM extracts meaning → Structured emergency state →
Protocol engine → Approved action → LLM converts action into natural
language → Voice output.

This is safer than allowing an unrestricted LLM to generate medical
instructions directly.

# 12. Failure Handling

The system must expect uncertainty. If speech is unclear, it should ask
a simple clarification. Unsupported emergencies should not trigger
improvisation. Conflicting information should update state to uncertain
rather than silently preserving an earlier assumption. User non-response
and network failures need explicit fallback behavior.

Because connectivity can be unreliable, the team should investigate
graceful degradation and whether critical protocol content can be
cached. Full offline AI is not an MVP requirement.

# 13. Multilingual Strategy

Initial languages to investigate: Amharic, Afaan Oromo, and English.

Architecture: User language → Speech recognition → Semantic
understanding → Language-independent emergency state → Protocol engine →
Localized response → Voice synthesis.

Emergency logic should not be duplicated separately for every language.

# 14. Data Model

User: id, preferredLanguage, createdAt.

Incident: id, userId, emergencyType, status, startedAt, location,
currentStage, createdAt, updatedAt.

PatientState: ageGroup, consciousness, breathing, majorSymptoms,
relevantObservations.

IncidentEvent: id, incidentId, eventType, value, source, timestamp.

ConversationMessage: id, incidentId, role, transcript, language,
timestamp.

ProtocolState: incidentId, protocol, currentStep, completedSteps,
nextPriority, escalationState.

# 15. API Architecture

Possible REST endpoints:\
POST /api/incidents\
GET /api/incidents/:id\
PATCH /api/incidents/:id\
POST /api/incidents/:id/voice\
POST /api/incidents/:id/message\
GET /api/incidents/:id/timeline\
GET /api/incidents/:id/handoff\
GET /api/protocols\
GET /api/protocols/:id\
GET /api/responder/incidents\
GET /api/responder/incidents/:id

Exact APIs may change during implementation.

# 16. Real-Time Communication

Socket.IO or WebSockets can power live responder updates. When a
bystander answers a question, the incident state updates, the backend
emits an event, and the responder dashboard reflects the change.

# 17. Suggested Technology Stack

Frontend: React + Vite, with Tailwind CSS, React Router, and TanStack
Query as appropriate.

Backend: Node.js + Express.js for authentication, incident management,
protocol orchestration, AI/Voxide integration, WebSockets, and database
access.

Database: MongoDB is a practical MVP option because incident structures
and conversation records are flexible. PostgreSQL remains a viable
alternative.

Real-time: Socket.IO.

AI: select an LLM provider based on API availability, latency, cost,
reasoning quality, and structured-output support.

Deployment: Vercel for frontend, Render or similar for backend, MongoDB
Atlas for database, and investigate EthioDeploy.

# 18. Security & Privacy

Emergency information can be sensitive. Use data minimization, protected
responder access, authentication, HTTPS, careful logging, and an
explicit retention policy. Avoid storing unnecessary voice or transcript
data.

# 19. Authentication

Possible roles: USER, RESPONDER, ADMIN.

User: create incident, interact with ድረስ (DERES), view own incident.\
Responder: view active/assigned incidents, inspect handoff, view
timeline.\
Admin: manage protocols and system activity. Admin features may be
minimized or omitted from MVP.

# 20. Frontend Screens

1\. Landing --- clearly communicate guided emergency help.\
2. Emergency Start --- large START EMERGENCY action and language
selection.\
3. Active Emergency --- minimal UI centered on voice, one question, one
action, and confirmation.\
4. Incident Status --- emergency type, current stage, completed actions,
observations.\
5. Responder Dashboard --- active incidents.\
6. Incident Details --- summary, timeline, patient state,
conversation-derived information, and status.

# 21. UX Principles

During an emergency, less is more. Prioritize voice, one question, one
action, confirmation, and the next action. Avoid large paragraphs,
complicated menus, unnecessary animation, technical terminology, and
multiple simultaneous instructions.

# 22. Example Interaction

User: "My friend collapsed."\
ድረስ (DERES): "I'm going to help you assess the situation. Is your friend
awake and responding when you speak to them?"\
User: "No."\
ድረስ (DERES): "Is your friend breathing normally?"\
User: "Yes."

The system updates the incident state and follows the appropriate
supported protocol. The user never needs to understand the underlying AI
architecture.

# 23. AI Prompt Architecture

The LLM should receive structured context rather than a generic request
such as "Help this person." The system prompt should define its role as
the language interface for an emergency first-response system and
explicitly prohibit diagnosis, invented procedures, contradiction of the
protocol engine, excessive questioning, and false certainty.

Current incident context should include emergency type, known patient
state, uncertainty, and current protocol step.

# 24. Structured AI Output

Where possible, the LLM should return structured data such as intent,
observations, user needs, and confidence. The backend validates the
output before changing incident state.

# 25. Guardrails

LLM Output → Schema Validation → State Validation → Protocol Validation
→ Safety Rules → Approved Response → Voxide.

If validation fails, reject the generated action and use a safe fallback
or escalate/clarify.

# 26. Observability

Track request latency, voice processing latency, LLM latency, protocol
transitions, failed responses, validation failures, user interruptions,
unsupported scenarios, and session completion. Basic developer logging
is sufficient for the hackathon.

# 27. Testing Strategy

Unit tests: state transitions, protocol logic, API endpoints,
validation, handoff generation.

Integration tests: Voice → Backend → LLM → Protocol → Incident.

Scenario tests: scripted emergency conversations with expected state
transitions.

Failure tests: unclear speech, contradictory answers, unsupported
emergencies, network failures, malformed LLM output, Voxide failure, and
duplicate messages.

# 28. Evaluation Metrics

Response latency; question relevance; state accuracy; protocol
adherence; language accuracy; handoff completeness; and safety. The
product should be evaluated as a system, not merely on whether the
chatbot talks.

# 29. MVP Scope

MUST HAVE: Voxide integration, voice conversation, at least one
carefully selected emergency protocol, emergency state engine, LLM
integration, controlled protocol layer, incident timeline, responder
handoff, basic responder dashboard, multilingual demonstration, and
deployed working prototype.

SHOULD HAVE: multiple scenarios, Socket.IO, location sharing,
authentication, incident history, robust error handling.

COULD HAVE: emergency-service integration, SMS fallback, offline
protocol mode, analytics, responder assignment, advanced geolocation,
wearable integration.

WILL NOT BUILD FOR MVP: ambulance fleet management, hospital management
system, full medical records, AI diagnosis, nationwide dispatch,
unrestricted medical chatbot, complete offline LLM, complicated user
accounts, payment system.

# 30. Hackathon Demo

The demo should tell one continuous story: Emergency → Voice → AI
understanding → Guided action → State tracking → Responder handoff.

Scenario: a person collapses. The user activates ድረስ (DERES), speaks
naturally, answers critical questions, the emergency state changes in
real time, the responder dashboard receives the incident, the handoff
updates, and multilingual interaction is demonstrated.

# 31. Why Voice Matters

Voice is not merely a STARK requirement. During an emergency, the user
may have both hands occupied, be moving, be assisting another person, or
be unable to focus on a screen. Voice is therefore a natural interaction
layer for the problem and gives Voxide a meaningful role in the core
architecture.

# 32. Differentiation

ድረስ (DERES) should not claim that nobody has built AI for emergencies. Its
differentiation is the combination of: bystander-first design,
voice-first interaction, state-aware assistance, protocol-controlled AI,
responder handoff, and Ethiopian language focus.

# 33. Research / Scholarxiv Direction

Research questions should cover: bystander behavior; Ethiopian first-aid
knowledge gaps; voice interaction and cognitive load; safe LLM
interaction with predefined protocols; uncertainty representation;
conversational-to-structured responder handoff; multilingual emergency
voice interaction; and operation under unreliable connectivity.

# 34. Competitive Research Direction

Continue screening emergency dispatch platforms, AI emergency
assistants, first-aid apps, voice emergency systems, multilingual
emergency communication, AI clinical decision-support systems, and
bystander first-aid systems. The goal is to identify what existing
products solve, what they do not solve, and where ድረስ (DERES) should focus.

# 35. Development Phases

Phase 0 --- Validation: protocols, scenarios, Voxide, LLM, competitors,
MVP boundary.\
Phase 1 --- Foundation: repository, frontend, backend, database,
environment, incident model.\
Phase 2 --- Voice: Voxide, speech input/output, languages.\
Phase 3 --- AI: intent extraction, structured output, context, state
updates.\
Phase 4 --- Protocol Engine: scenarios, steps, transitions, validation,
fallbacks.\
Phase 5 --- Incident System: timeline, events, status, handoff.\
Phase 6 --- Responder Dashboard: active incidents, live updates,
details, handoff.\
Phase 7 --- Testing: scenarios, edge cases, voice, multilingual,
protocol adherence, failures.\
Phase 8 --- Demo & Deployment: hosting, demo, presentation,
architecture, Scholarxiv evidence, GitHub history, STARK Changelog.

# 36. Team Responsibilities

Obsan --- Technical Lead / Full Stack: architecture, backend, AI
orchestration, protocol architecture, database, integration, deployment,
technical coordination.

Melkamu --- Full Stack: frontend, backend APIs, real-time features,
incident management, responder dashboard, integration support, testing.

Samuel --- UI/UX: emergency UX, visual design, user flow, dashboard
design, accessibility, prototype design, presentation visuals.

# 37. Repository Structure

deres/\
├── client/ (components, pages, hooks, services, state)\
├── server/ (controllers, routes, services, protocols, ai, voice,
incidents, models, middleware, utils)\
├── docs/ (architecture, research, protocols, decisions)\
├── README.md\
└── package.json

# 38. Git Workflow

Recommended branches: main, develop, feature/voice,
feature/incident-engine, feature/protocol-engine, feature/dashboard,
feature/ai-orchestration.

Every major feature should have meaningful commits and clear
descriptions. This also helps demonstrate legitimate development
history.

# 39. Architecture Decision Records

Document major decisions such as: why voice-first; why protocol-first
instead of unrestricted LLM; database choice; real-time technology;
selected emergency scenarios; multilingual architecture; and privacy
strategy.

# 40. Major Risks

Medical safety --- mitigate with protocol-first architecture and
professional validation.\
LLM hallucination --- constrained structured outputs and protocol
validation.\
Voice recognition errors --- confirmation questions and fallbacks.\
Connectivity --- graceful failure and investigation of cached
protocols.\
Scope explosion --- small number of scenarios.\
Lack of real emergency-service integration --- demonstrate simulated
responder workflow and never claim real integration.\
Competitive overlap --- continuous research and narrowing of
differentiation.

# 41. Ethical Considerations

ድረስ (DERES) must not present itself as a substitute for professionals. Its
role is guidance while professional help is being sought or awaited. The
system should favor transparency, escalation, uncertainty, minimal data
collection, and safe fallback behavior.

# 42. Long-Term Vision

If the MVP proves the core interaction, ድረስ (DERES) could become a broader
emergency-assistance layer connecting a bystander, ድረስ (DERES), emergency
services, ambulance systems, and hospitals. Future integrations may
include SMS, wearables, location services, community first responders,
and public safety organizations. These are future directions, not MVP
requirements.

# 43. Success Definition

ድረስ (DERES) should not be considered successful merely because the AI
talks. The prototype should show a clear transformation: BEFORE --- an
untrained person is confused; DURING --- ድረስ (DERES) asks relevant
questions and guides the person through a controlled workflow; AFTER ---
the system has structured the incident, tracked state, recorded
important actions, and generated a responder-ready handoff.

# 44. Core Product Statement

ድረስ (DERES) is a multilingual, voice-first AI first-responder system that
guides untrained bystanders through the first critical minutes of an
emergency using controlled protocols while continuously building a
structured incident record for professional handoff.

# 45. Final Engineering Principle

The LLM should never be the entire product.

LLM understands language → Emergency State determines what is happening
and what is known → Protocol Engine determines what can safely be
instructed → Voice Response guides the user → User Action updates the
state.

The engineering core is: Voice + LLM + State + Protocols + Incident
Memory + Handoff.

# 46. Immediate Team Action Items

Before significant coding begins, agree on five decisions:\
1. Emergency scenarios --- select initial MVP scenarios after protocol
research.\
2. Voxide capabilities --- confirm supported languages, API behavior,
latency, and integration requirements.\
3. LLM --- select provider based on structured outputs, latency, cost,
and reliability.\
4. Protocol source --- identify authoritative first-aid/medical
guidance.\
5. MVP boundary --- freeze the first version before implementation
begins.

# 47. Decision Gate

After completing the research, ask: Can we demonstrate that ድረስ (DERES)
provides a meaningful capability that a generic LLM, generic SOS app,
and existing emergency platform do not provide together?

If yes, build. If not, narrow or modify the concept before spending the
hackathon implementation period on it.

# Research Sources

-   **Ethiopian Ambulance Alliance Network / HEARTS:**
    https://www.heartscare.net/

-   **RapidSOS UNITE:** https://rapidsos.com/public-safety/unite/

-   **RapidSOS Transcription & Translation:**
    https://rapidsos.com/public-safety/transcription-translation/

-   **RapidSOS Harmony:** https://rapidsos.com/public-safety/harmony/

-   **Addis Ababa trauma/pre-hospital care study:**
    https://pmc.ncbi.nlm.nih.gov/articles/PMC8843143/

-   **Addis Ababa EMS assessment (2026):**
    https://www.sciencedirect.com/science/article/pii/S2949916X26000174

-   **EAAN/HEARTS implementation report (2026):**
    https://www.medrxiv.org/content/10.64898/2026.07.22.26358728

**Important:** This is a hackathon prototype architecture, not a medical
product specification. Any real-world deployment would require clinical
validation, emergency-service coordination, privacy/security review,
regulatory assessment, and appropriate professional oversight.
