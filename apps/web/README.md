# @voicesos/web

React + Vite frontend for DERES (Melkamu · Tasks 18–19).

## Task 18 — scaffold

- React + Vite + TypeScript in the monorepo
- Routing for emergency + responder flows
- Folder layout: `components`, `pages`, `hooks`, `services`, `state`
- State boundaries: `EmergencySessionProvider`, `ResponderUiProvider`

## Task 19 — API client & error model

- Typed clients for incidents, messages, actions, timeline, handoff, protocols, voice, sessions, health
- Shared `@voicesos/shared` request/response contracts only — no local duplicate types
- `ApiClientError` + `toUiErrorMessage` so backend failures become controlled UI state
- Retry for transient network / 5xx / upstream errors
- TanStack Query provider with loading / error / retry defaults
- `useConnectionStatus` for browser + API reachability (`ConnectionStatus`)
- `ApiErrorState` / `ApiLoadingState` components
- Demo surface: `/emergency/connection`

```ts
import { incidentsApi, toUiErrorMessage } from '@/services/api';
import { useIncidentQuery, useCreateIncidentMutation } from '@/hooks';
```

Until Obsan Task 10 lands, incident routes may return `NOT_FOUND` — that is still a
**controlled** `ApiClientError`, not an uncaught exception.

## Run

```bash
npm install
npm run build --workspace @voicesos/shared
npm run dev --workspace @voicesos/web
```

App: http://localhost:5173  
API proxy: `/api` → `VITE_API_URL` (default `http://localhost:4000`)

## Structure

```text
src/
├── components/     AppShell, PlaceholderPage, ApiState
├── pages/          emergency + responder screens
├── routes/
├── services/api/   client, incidents, protocols, health, queryKeys
├── hooks/          useApiQueries, useApiMutations, useConnectionStatus
├── providers/      AppQueryProvider
├── state/
├── App.tsx
└── main.tsx
```

## Next

- **Task 20** — emergency UI (after Samuel's UX)
- **Task 23** — responder dashboard (after Samuel's design)
