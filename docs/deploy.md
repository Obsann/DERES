# Deploy DERES — Render (API) + Vercel (web)

The API runs on Render. The bystander and responder UI runs on Vercel. MongoDB is Atlas. Do not put secrets in git.

## 1. MongoDB Atlas

1. Create a free cluster.
2. Database Access: a user with a password you will not commit.
3. Network Access: allow `0.0.0.0/0` (Render outbound IPs are not a single address).
4. Connect → Drivers → copy the `mongodb+srv://…` URI.

## 2. Render (API)

1. Push this repo’s `main` (includes `render.yaml`).
2. [Render](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect `Obsann/DERES`, branch `main`.
4. When prompted, set:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Atlas URI |
| `LLM_API_KEY` | Same key as local (OpenRouter / Groq / OpenAI) |
| `LLM_BASE_URL` | Same as local, e.g. `https://openrouter.ai/api/v1` |
| `LLM_MODEL` | Same as local |
| `CLIENT_URL` | Vercel origin, no trailing slash, e.g. `https://deres.vercel.app` — add after step 3 if the URL is not known yet; use a placeholder then edit |
| `RESPONDER_INVITE` | Shared passphrase for the responder screen |

`SESSION_SECRET` is generated. `PORT` is set by Render.

5. Wait until `https://<service>.onrender.com/api/health` returns `ok`.
6. Free instances sleep. The first request after idle can take about a minute.

## 3. Vercel (web)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → `Obsann/DERES`.
2. Leave the root as the repository root (do not set Root Directory to `apps/web`). `vercel.json` already builds the workspace.
3. Environment variables (Production):

| Variable | Value |
|---|---|
| `VITE_API_URL` | Render origin, no trailing slash, e.g. `https://deres-api.onrender.com` |
| `VITE_VOXIDE_PUBLIC_KEY` | `vox_pub_…` from the Voxide dashboard |

4. Deploy.
5. Copy the `https://….vercel.app` URL into Render `CLIENT_URL` (no trailing slash) and **Manual Deploy** the API so CORS matches.
6. Voxide dashboard → domain whitelist → add the Vercel hostname.

## 4. Check

- Open the Vercel URL. Start an emergency. Buttons should speak protocol lines.
- `/responder` with `RESPONDER_INVITE`.
- Phone: HTTPS is required for install / Add to Home Screen.

## Local reminder

`CLIENT_URL` may be a comma-separated list if you need both production and a preview origin.
