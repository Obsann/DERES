# Assumptions traceability matrix

**Task 38 verify:** every major product assumption → Research, Decision, or Hypothesis.

Status: `Supported` = OK to build on · `Open` = needs work before hard claims · `Rejected` = explicitly out of scope

| ID | Assumption | Label | Status | Trace |
|---|---|---|---|---|
| A1 | Relatives/bystanders often provide first trauma care in Addis Ababa | Research | Supported | PMC8843143; `problem-evidence.md` |
| A2 | Lack of knowledge is a major barrier to providing care | Research | Supported | PMC8843143 (61.2%) |
| A3 | Ambulance-only solutions leave a scene-side guidance gap | Decision | Supported | Spec §2–§5; HEARTS/RapidSOS exist for other layers |
| A4 | Primary user is the bystander; secondary is the responder | Decision | Supported | Spec §6; team assignments |
| A5 | Voice is the right primary interface for this user | Decision + Hypothesis | Open | Decision for product; stress/HCI benefit = Hypothesis (`voice-interaction.md`) |
| A6 | Protocol engine must bound the LLM | Decision | Supported | Spec §11, §25; Tasks 5–8 |
| A7 | Structured emergency state is required (not chat history alone) | Decision | Supported | Spec §9; shared `EmergencyState` |
| A8 | Uncertainty must be explicit in state and handoff | Decision | Supported | Task 3 contracts; safety architecture |
| A9 | One scoped MVP protocol is enough to prove the thesis | Decision | Supported | Spec §10, §29 |
| A10 | Amharic + Afaan Oromo + English can all demo at equal quality | Hypothesis | Open | Pending Voxide Task 9 |
| A11 | State can be language-independent with localised prompts | Decision | Supported | Spec §13; `LocalisedText` |
| A12 | Socket.IO live dashboard is required for MVP | Decision (SHOULD) | Open | Spec SHOULD HAVE; Task 13/24 |
| A13 | DERES replaces RapidSOS / HEARTS | Rejected | Rejected | Spec §5, §32; `competitive-context.md` |
| A14 | DERES is an AI doctor / diagnostician | Rejected | Rejected | Spec §5 |
| A15 | Full offline LLM is required for MVP | Rejected | Rejected | Spec WILL NOT BUILD |
| A16 | Hackathon demo equals clinical deployment readiness | Rejected | Rejected | Spec closing disclaimer |
| A17 | Authoritative first-aid sources can be encoded as machine protocols | Hypothesis | Open | Task 6 must cite sources; clinical review later |
| A18 | Conversation can be transformed into trustworthy handoff | Decision + Hypothesis | Open | Architecture Decision; accuracy = Hypothesis until Task 11/25 tested |
| A19 | Connectivity may fail mid-incident | Hypothesis | Supported (as risk) | Spec §12; Task 26 failure handling |
| A20 | Shared TypeScript contracts prevent FE/BE drift | Decision | Supported | Task 3; `docs/api/shared-contracts.md` |

## How to update

1. Add a new row when a product claim appears in demo scripts, PRs, or Scholarxiv notes.
2. Prefer promoting Hypothesis → Research/Decision only with a citation or recorded team decision.
3. Never delete Rejected rows — they document scope discipline.
