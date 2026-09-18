# Research questions — status board

From `task.md` Phase 1. Each question must have a status and a pointer into the research trail.

| Research question | Status | Where addressed | Notes |
|---|---|---|---|
| Bystander emergency response behavior | **Addressed (initial)** | `problem-evidence.md` | Addis Ababa scene-care provider mix |
| First-aid knowledge gaps | **Addressed (initial)** | `problem-evidence.md` | 61.2% lack of knowledge among non-helpers |
| Voice interaction under cognitive load | **Partial** | `voice-interaction.md` | Product Decision + labeled Hypothesis; UX to validate |
| Multilingual emergency communication | **Partial** | `multilingual-emergency.md` | Architecture Decision; quality gate open |
| Safe LLM + protocol architectures | **Addressed (design)** | `safe-ai-protocol-architecture.md` | Engineering Decision; implement Tasks 5–8 |
| Structured emergency-state representation | **Addressed (design)** | Shared types + this trail | Implemented in `@voicesos/shared` |
| Conversation-to-handoff transformation | **Partial** | Spec §15 / Task 11–25 | Schema Decision done; generation/tests pending |
| Uncertainty handling | **Addressed (design)** | Shared `Certainty` / handoff rules | Runtime enforcement = Tasks 4, 8, 11 |
| Connectivity limitations | **Partial** | Spec §12; Task 26 | Risk accepted; MVP graceful failure, not offline AI |

## Still needed (team follow-ups)

- [ ] Confirm Voxide language matrix (Obsan Task 9) → update A10
- [ ] Encode MVP protocol with authoritative citation (Obsan Task 6) → update A17
- [x] Complete Task 39 competitive matrix file (`competitive-analysis.md`)
- [ ] Paste Scholarxiv workspace URL into `scholarxiv.md` once created
- [ ] Samuel UX stress review → promote or demote voice Hypothesis A5
