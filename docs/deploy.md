# Deploy DERES — Render (API) + Vercel (web)

The API is a normal Render **Web Service**. The UI is Vercel. MongoDB is Atlas. Do not put secrets in git.

## 1. MongoDB Atlas

1. Create a free cluster.
2. Database Access: a user with a password you will not commit.
3. Network Access: allow `0.0.0.0/0` (Render outbound IPs are not a single address).
4. Connect → Drivers → copy the `mongodb+srv://…` URI.

## 2. Render — Web Service (not Blueprint)

1. Merge `feat/deploy` into `main`.
2. [Render](https://dashboard.render.com) → **New** → **Web Service** → connect `Obsann/DERES`.
3. Settings:

| Field | Value |
|---|---|
| Branch | `main` |
| Root Directory | *leave blank* (repository root). Do **not** set `apps/server` |
| Runtime | Node |
| Build command | `npm install --include=dev && npm run build:server` |
| Start command | `npm run start:server` |
| Instance | Free |
| Health check path | `/api/health` |

4. Environment:

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas URI |
| `LLM_API_KEY` | Same as local |
| `LLM_BASE_URL` | Same as local, e.g. `https://openrouter.ai/api/v1` |
| `LLM_MODEL` | Same as local |
| `SESSION_SECRET` | Long random string (Render can generate) |
| `RESPONDER_INVITE` | Passphrase for the responder screen |
| `CLIENT_URL` | Vercel origin, no trailing slash — placeholder is fine until Vercel exists, then edit and **Manual Deploy** |

Leave `PORT` unset. Render injects it.

5. Deploy. Confirm `https://<name>.onrender.com/api/health` returns `ok`.
6. Free instances sleep. The first request after idle can take about a minute.

## 3. Vercel (web)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → `Obsann/DERES`.
2. Leave the root as the repository root (do not set Root Directory to `apps/web`).
3. Environment variables (Production):

| Variable | Value |
|---|---|
| `VITE_API_URL` | Render origin, no trailing slash, e.g. `https://deres-api.onrender.com` |
| `VITE_VOXIDE_PUBLIC_KEY` | `vox_pub_…` from the Voxide dashboard |

4. Deploy.
5. Put the `https://….vercel.app` URL into Render `CLIENT_URL` and **Manual Deploy** the API.
6. Voxide dashboard → domain whitelist → add the Vercel hostname.

## 4. Check

- Open the Vercel URL. Start an emergency. Buttons should speak protocol lines.
- `/responder` with `RESPONDER_INVITE`.
- Phone: HTTPS is required for Add to Home Screen.

`CLIENT_URL` may be a comma-separated list if you need production and a preview origin.
