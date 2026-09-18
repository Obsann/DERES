# VoiceSOS — AI First Responder

**Team COD1 · STARK Hackathon 2026**

VoiceSOS is a multilingual, voice-first AI first-responder system that guides untrained
bystanders through the first critical minutes of an emergency using controlled protocols,
while continuously building a structured incident record for professional handoff.

## What VoiceSOS is not

An AI doctor, a diagnostic system, a generic chatbot, an ambulance-dispatch replacement,
an ambulance-tracking platform, or an autonomous medical decision-maker.

## Core engineering principle

```text
LLM understands language
      ↓
Emergency State determines what is known
      ↓
Protocol Engine determines what can safely be instructed
      ↓
Voice Response guides the user
      ↓
User Action updates the state
```

The LLM is a component, not the safety authority. The protocol engine — not the model —
decides what guidance is allowed.

## Architecture

```text
USER
  ↓
VOXIDE VOICE
  ↓
CONVERSATION ENGINE
  ↓
EMERGENCY STATE ENGINE
  ↓
PROTOCOL / SAFETY ENGINE
  ↓
INCIDENT RECORD + HANDOFF ENGINE
  ↓
RESPONDER DASHBOARD
```

## Repository structure

```text
voicesos/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── server/       # Node.js + Express backend
├── packages/
│   ├── shared/       # Canonical types, enums, events, API contracts
│   ├── protocols/    # Machine-readable emergency protocols
│   └── validation/   # Schema / safety validation
├── docs/
│   ├── architecture/
│   ├── research/
│   ├── decisions/
│   └── api/
├── scripts/
├── task.md               # Master implementation plan
├── team_assignments.md   # Per-person task breakdown
└── git-workflow.md       # Branching, review, and merge process
```

## Technology

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express (TypeScript) |
| Database | MongoDB |
| Real-time | Socket.IO |
| Voice | Voxide |
| LLM | To be selected (task.md section 46) |

## Getting started

Requires Node.js 20+ and npm 10+.

```bash
npm install
cp .env.example .env    # then fill in real values
npm run dev --workspace @voicesos/server
```

Verify the backend is up:

```bash
curl http://localhost:4000/api/health
```

## Team

| Member | Area |
|---|---|
| Obsan | Platform, AI orchestration, protocol engine, state, security, deployment |
| Melkamu | Frontend, responder dashboard, real-time UI, integration testing |
| Samuel | Emergency UX, design system, accessibility, presentation |

## Documentation

- [`task.md`](./task.md) — master implementation checklist and phase plan
- [`team_assignments.md`](./team_assignments.md) — task ownership and dependency order
- [`git-workflow.md`](./git-workflow.md) — branching, commits, PRs, merge rules

## Disclaimer

This is a hackathon prototype architecture, not a medical product. Real-world deployment
would require clinical validation, emergency-service coordination, privacy and security
review, regulatory assessment, and professional oversight.
