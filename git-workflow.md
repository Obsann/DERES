# TEAM COD1 — ድረስ (DERES)
## Git Workflow & Collaboration Standard

**Project:** ድረስ (DERES) — AI First Responder  
**Team:** COD1  
**Version:** 1.0

---

# 1. Purpose

This document defines how Team COD1 uses Git/GitHub during the STARK Hackathon.

Goals:

- Keep `main` stable.
- Make work traceable.
- Prevent overwrites.
- Make development history demonstrate genuine work.
- Keep reviews fast.
- Keep STARK Changelog/project tracking consistent.
- Make rollback possible.

# 2. Branch Structure

```text
main
│
├── feat/...
├── fix/...
├── refactor/...
├── docs/...
├── test/...
└── chore/...
```

`main` is the stable/demo branch.

Rules:

- Never develop directly on `main`.
- Never force-push `main`.
- Never merge unfinished work.
- Keep `main` deployable.

# 3. Branch Naming

Use lowercase kebab-case.

### Features

```text
feat/voice-session
feat/incident-state
feat/protocol-engine
feat/responder-dashboard
feat/handoff-system
```

### Fixes

```text
fix/socket-reconnect
fix/llm-validation
fix/voice-timeout
```

### Refactoring

```text
refactor/incident-service
refactor/shared-types
```

### Documentation

```text
docs/architecture
docs/api-contracts
docs/research
```

### Tests

```text
test/protocol-validation
test/incident-state
```

### Chores

```text
chore/setup-eslint
chore/configure-ci
```

# 4. Branch Ownership

Normally one person owns a feature branch. Other teammates can contribute, but avoid multiple people independently rewriting the same branch.

# 5. Create a Branch

Always start from current `main`:

```bash
git switch main
git pull origin main
git switch -c feat/your-feature
```

# 6. Before Starting Work

```bash
git status
git branch
git pull origin main
```

Confirm the correct branch and clean starting point.

# 7. Commit Convention

Use:

```text
type(scope): short description
```

Examples:

```text
feat(voice): integrate Voxide voice session
feat(state): add incident state machine
feat(protocol): add protocol validation
feat(handoff): generate structured handoff
feat(dashboard): add active incident view

fix(ai): reject malformed model output
fix(voice): handle speech timeout
fix(api): validate incident payload

refactor(state): simplify transition validation

test(protocol): add invalid transition cases

docs(architecture): document AI safety pipeline
chore(ci): add GitHub Actions checks
```

# 8. Commit Types

| Type | Meaning |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Behavior-preserving restructuring |
| `test` | Tests |
| `docs` | Documentation |
| `chore` | Tooling/configuration |
| `perf` | Performance |
| `build` | Build/dependency changes |

Avoid meaningless messages such as `update`, `changes`, `final final`, or `everything`.

# 9. Commit Size

Prefer focused commits:

```text
feat(state): add incident schema
feat(state): add transition validation
test(state): add transition tests
```

Avoid putting an entire subsystem into one opaque commit when smaller logical commits are practical.

# 10. Pull Request Workflow

```text
Issue
 ↓
Branch
 ↓
Implementation
 ↓
Local test
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Review
 ↓
Fix review comments
 ↓
Merge
 ↓
Delete branch
```

# 11. Push

```bash
git push -u origin feat/your-feature
```

Later:

```bash
git push
```

# 12. Pull Request Requirements

### Title

Follow commit convention, e.g.:

```text
feat(protocol): add protocol validation engine
```

### Description

```text
## What
What was implemented?

## Why
Why is it needed?

## How
How does it work?

## Testing
What was tested?

## Dependencies
Does another feature depend on it?

## Risks
Anything reviewers should watch for?
```

# 13. PR Checklist

- [ ] Code builds.
- [ ] Tests pass.
- [ ] Lint passes.
- [ ] No secrets committed.
- [ ] No unnecessary files committed.
- [ ] API/schema changes documented.
- [ ] Relevant documentation updated.
- [ ] UI tested where applicable.
- [ ] Error states tested.
- [ ] PR description completed.

# 14. Review Rules

At least one teammate should review meaningful PRs. Prefer two-person review for critical components:

- AI orchestration.
- Protocol engine.
- Emergency state.
- Safety validation.
- Authentication.
- Database schema changes.
- Production deployment.

Review correctness, architecture, safety, security, maintainability, testing and scope.

# 15. Merge Strategy

Prefer **Squash and merge** for feature PRs when practical.

Keep resulting history readable:

```text
main
│
├── feat: add incident state engine
├── feat: integrate Voxide
├── feat: add protocol validation
├── feat: add responder dashboard
└── fix: handle AI timeout
```

# 16. Keeping a Feature Branch Updated

```bash
git fetch origin
git switch main
git pull origin main
git switch feat/your-feature
git merge main
```

Or, for a developer comfortable with rebasing:

```bash
git fetch origin
git rebase origin/main
```

Do not rewrite a shared branch without agreement.

# 17. Merge Conflicts

1. Stop and understand both changes.
2. Do not blindly choose ours/theirs.
3. Resolve logically.
4. Run tests.
5. Review the final diff.
6. Commit the resolution.

Useful commands:

```bash
git status
git diff
```

# 18. Never Do This

Never force-push `main`:

```bash
git push --force origin main
```

Do not use destructive reset commands unless you fully understand what will be lost.

Never commit:

```text
.env
API keys
tokens
private credentials
database passwords
service secrets
```

# 19. Environment Variables

Use local `.env`; commit only `.env.example`.

Example:

```env
PORT=
MONGODB_URI=
LLM_API_KEY=
VOXIDE_API_KEY=
CLIENT_URL=
```

Use the actual provider's exact variable names in the real project; never place credentials in `.env.example`.

# 20. `.gitignore`

At minimum:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
.DS_Store
*.log
```

# 21. GitHub Issues

Every significant task should have an issue.

Useful categories:

```text
feature
bug
research
design
documentation
security
testing
deployment
```

Example:

```text
[Feature] Implement incident state engine
```

Include goal, requirements and acceptance criteria.

# 22. Issue-to-PR Traceability

Whenever practical:

```text
Issue #23
↓
Branch feat/incident-state
↓
Commits
↓
PR #31
↓
Merge
```

Use GitHub issue-closing syntax where appropriate:

```text
Closes #23
```

# 23. STARK Changelog Discipline

Because the hackathon requires development evidence, significant work should be recorded with:

- Date.
- Contributor.
- Feature/change.
- Why it was done.
- Related issue/PR.
- Important decision.
- Demo/evidence where appropriate.

Do not manufacture history. The repository and changelog must represent actual work performed.

# 24. Daily Git Routine

Start:

```bash
git switch main
git pull origin main
git switch -c feat/your-feature
```

During work:

```bash
git status
git diff
```

Commit logically:

```bash
git add .
git commit -m "feat(scope): description"
```

Push:

```bash
git push -u origin feat/your-feature
```

# 25. End-of-Day Routine

- [ ] Push work to remote.
- [ ] Make unfinished work identifiable.
- [ ] Use clear commits.
- [ ] Update issue status.
- [ ] Record blockers.
- [ ] Tell teammates about integration dependencies.

Never leave important work only on one computer.

# 26. Hotfix Workflow

```text
main
 ↓
fix/critical-problem
 ↓
test
 ↓
PR
 ↓
merge
 ↓
deploy
```

# 27. Demo/Release Tags

When a real milestone is stable:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Suggested milestones:

```text
v0.1.0 — Foundation
v0.2.0 — Voice vertical slice
v0.3.0 — Protocol + state engine
v0.4.0 — Handoff + dashboard
v0.5.0 — MVP
v1.0.0 — Final hackathon release
```

Only tag genuine milestones.

# 28. Recommended GitHub Labels

```text
priority:p0
priority:p1
priority:p2

area:frontend
area:backend
area:ai
area:voice
area:protocol
area:state
area:dashboard
area:ux
area:research
area:deployment
area:security
area:testing

status:blocked
status:needs-review
status:ready
```

Optional ownership labels:

```text
owner:obsan
owner:melkamu
owner:samuel
```

# 29. Shared Files

Changes to these deserve extra care:

```text
task.md
team_assignments.md
git-workflow.md
README.md
.env.example
shared types
database schemas
API contracts
protocol schemas
architecture documents
```

Communicate before two people edit the same architecture/schema file.

# 30. Shared Type Strategy

Where practical, keep canonical shared structures in:

```text
packages/shared/
├── types/
├── enums/
├── events/
└── validation/
```

Examples:

```text
IncidentStatus
EmergencyType
IncidentEvent
Handoff
ProtocolStep
```

Avoid duplicating the same definitions independently across frontend/backend.

# 31. API Contract Rule

Before frontend/backend integration, agree on:

```text
Endpoint
HTTP method
Request body
Response body
Errors
Authentication
Status codes
```

Document exact contracts in project documentation.

# 32. Real-Time Event Rule

Use consistent event names, e.g.:

```text
incident.created
incident.updated
incident.state_changed
incident.message_added
incident.action_recorded
incident.handoff_updated
incident.closed
```

Document payloads.

# 33. Safety-Critical Merge Rule

The following cannot be merged casually:

- Protocol selection.
- Protocol instructions.
- Safety rules.
- Emergency state transitions.
- AI action validation.
- Escalation logic.

Require:

1. Code review.
2. Tests.
3. Clear source/reference.
4. Explicit acceptance criteria.

# 34. Definition of Done for Code

```text
Implementation
     +
Tests
     +
Review
     +
Documentation
     +
Integration
     +
Traceability
     =
DONE
```

# 35. Recommended Repository Protection

Configure GitHub so that:

- `main` is protected.
- PRs are required.
- CI checks pass before merge.
- Force pushes to `main` are disabled.
- Important branches are not casually deleted.
- Available secret/security scanning is enabled.

# 36. Communication Rule

Git is not a substitute for communication.

Tell teammates before:

- Changing an API.
- Changing database schema.
- Changing shared types.
- Changing protocol structure.
- Replacing a dependency.
- Rewriting a major component.
- Changing architecture.

# 37. Final Git Principle

> **Make the repository tell the truth about how the product was built.**

The final history should make it possible to follow:

```text
Problem
 ↓
Research
 ↓
Architecture
 ↓
Implementation
 ↓
Testing
 ↓
Iteration
 ↓
MVP
 ↓
Final product
```
