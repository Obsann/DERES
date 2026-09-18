# @voicesos/web

React + Vite frontend for VoiceSOS (Melkamu · Task 18).

## What Task 18 delivers

- React + Vite + TypeScript app in the monorepo workspace
- Routing for the emergency user flow and responder dashboard
- Folder layout matching the engineering spec: `components`, `pages`, `hooks`, `services`, `state`
- Shared types via `@voicesos/shared`
- API client boundary (thin health helper + Task 19 stubs)
- Application state boundaries (`EmergencySessionProvider`, `ResponderUiProvider`)
- Placeholder pages that render without crashing

## Run

From the repository root:

```bash
npm install
npm run build --workspace @voicesos/shared
npm run dev --workspace @voicesos/web
```

App: http://localhost:5173  
API proxy: `/api` → `VITE_API_URL` (default `http://localhost:4000`)

Copy `apps/web/.env.example` to `apps/web/.env.local` if you need to override the API URL.

## Structure

```text
src/
├── components/     App shell + placeholder page
├── pages/
│   ├── emergency/  start, language, session, timeline, summary, connection
│   └── responder/  incident list, active incident
├── routes/         path constants
├── services/api/   HTTP client boundary (Task 19 fills resources)
├── state/          emergency session + responder UI boundaries
├── hooks/          reserved for Task 19+
├── App.tsx
└── main.tsx
```

## Primary routes

| Path | Screen |
|---|---|
| `/` | Emergency start |
| `/emergency/language` | Language selection |
| `/emergency/session` | Active voice / instruction shell |
| `/emergency/:incidentId/timeline` | Timeline |
| `/emergency/:incidentId/summary` | Summary |
| `/emergency/connection` | Connection / error |
| `/responder` | Responder incident list |
| `/responder/incidents/:incidentId` | Active incident |

## Next tasks

- **Task 19** — typed resource clients, loading/error/retry UI states
- **Task 20** — real emergency UI (after Samuel's UX)
- **Task 23** — responder dashboard (after Samuel's dashboard design)
