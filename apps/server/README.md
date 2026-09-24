# @voicesos/server

Node.js + Express backend for VoiceSOS.

## Run

From the repository root:

```bash
npm install
npm run dev --workspace @voicesos/server
curl http://localhost:4000/api/health
```

The server starts without an LLM key or Voxide key so those integrations can
land later. Persistence is live when `MONGODB_URI` is set; without it the
process still boots and `/api/health` reports `database: "unknown"`.
In production the database, LLM and Voxide keys are all required.

| Script | Purpose |
|---|---|
| `npm run dev` | Watch mode via `tsx` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Types only, no output |

## Module layout

```text
src/
├── common/      config, logger, errors, response envelope, middleware, health
├── database/    MongoDB connection, models, indexes        (Task 2)
├── incidents/   incident record + emergency state engine   (Tasks 4, 10)
├── protocols/   protocol engine - the safety boundary      (Tasks 5, 6)
├── ai/          LLM orchestration + safety validation      (Tasks 7, 8)
├── voice/       Voxide session handling                    (Task 9)
├── handoff/     incident state -> responder summary        (Task 11)
├── security/    sessions, auth, route protection           (Task 12)
├── app.ts       Express assembly
└── index.ts     bootstrap and graceful shutdown
```

Each module has a README stating its boundary. The important one is
`protocols/`: the protocol engine decides what guidance is allowed, not the
LLM.

## Conventions

**One response shape.** Every route replies through `sendSuccess` or the error
handler, so the client only handles `ApiResponse` from `@voicesos/shared`:

```jsonc
{ "ok": true,  "data": { }, "requestId": "..." }
{ "ok": false, "error": { "code": "NOT_FOUND", "message": "..." }, "requestId": "..." }
```

**Throw, don't respond.** Raise an `AppError` subclass from
`common/errors.ts` and let the error handler turn it into a response. Anything
that is not an `AppError` is treated as a bug: logged with its stack, returned
as a generic `INTERNAL_ERROR`, never leaking internals.

**Correlation.** `requestId` appears in the response body, the `X-Request-Id`
header, and every log line for that request.

**Log redaction.** `common/logger.ts` redacts credentials and emergency content
(transcripts, prompts, location) before writing. Do not log request bodies.

## Configuration

Read once at startup by `common/config.ts`, which fails fast on a bad value.
See `.env.example` at the repository root.

| Variable | Default | Required in production |
|---|---|---|
| `NODE_ENV` | `development` | no |
| `PORT` | `4000` | no |
| `CLIENT_URL` | `http://localhost:5173` | yes |
| `MONGODB_URI` | — | yes |
| `LLM_API_KEY` | — | yes |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | no |
| `LLM_MODEL` | `gpt-4o-mini` | no |
| `VOXIDE_API_KEY` | — | yes |
| `VOXIDE_BASE_URL` | `https://api.voxide.app/v1` | no |
| `SESSION_SECRET` | `dev-only-session-secret` | yes |
| `RESPONDER_INVITE` | — | yes |
