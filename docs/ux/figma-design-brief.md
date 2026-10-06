# DERES — Figma design brief

Hand this file to a designer or paste the **Figma Make prompt** below into Figma Make. It describes the **product architecture**, not the look. **The current UI is not a visual reference.** Redesign layout, type, colour, motion, and interaction chrome from scratch. Do not copy the existing screens.

---

## Figma Make prompt (paste this)

```text
Design a production mobile-first PWA for DERES (ድረስ), a voice-first emergency first-aid app for untrained bystanders in Ethiopia, plus a separate responder dashboard for professionals.

Product: During the first minutes of an emergency, DERES speaks one instruction or one question at a time (English, Amharic, Afaan Oromo). The person can also tap large buttons. Spoken medical text is locked protocol copy — the UI must display it verbatim, never paraphrase. A persistent Call 907 (ambulance) control is always on screen during an emergency. This is not a chatbot, not a doctor, not an ambulance dispatch system.

Visual direction: Calm, high-contrast, hospital-grade urgency without horror. Huge type. Huge tap targets (min 56px, mic 88px+). One focal action. Almost no decoration. Dark or dimmable night-safe option. Works one-handed, outdoors, shaking hands. Do not look like a consumer AI chat app or a medical records system.

Design these screens at 390×844 (iPhone) AND 1280×800 (desktop session + responder):

BYSTANDER
1. Start — one headline, one primary “Start emergency”, language shown as a control. No login.
2. Language — three huge choices written in their own scripts: English, አማርኛ, Afaan Oromoo. No nested menus.
3. Active emergency (the main screen) — states:
   a. Opening: “What happened?” + “Someone collapsed / not responding” + “Something else”
   b. Question step: the protocol question as the only large text + Yes / No / Not sure + mic
   c. Action step: the protocol instruction as the only large text + Done / I can’t + Call 907 + mic
   d. Listening / thinking / speaking / error as mic phases (never colour-only)
   e. Offline: buttons still work; show a quiet banner
   f. Help arrived / end
   Side panel on desktop only: elapsed timer, ambulance called?, location shared?, step progress. On mobile, collapse this so it never competes with the instruction.
4. Unsupported emergency — only “Call 907 now”, no protocol.

RESPONDER (separate visual language: dense, scannable, not panicked)
5. Sign-in with invite (not consumer auth)
6. Live incident list sorted by urgency
7. Incident handoff: warnings first, then facts with certainty (known / unknown / uncertain — never hide unknown), actions taken, timeline. Live updates. Location. Do not look like the bystander app.

Voice UX: mic is the primary control. Phases: idle, listening, thinking, speaking, “say done”, error. Listening must be obvious without relying on colour (shape/motion/text). Tap mic while speaking = interrupt. If mic fails, the screen is still fully usable.

Hard constraints: one question or one action at a time; never a list of 15 medical steps as the main UI; never invent medical copy; Amharic/Oromo must not be Latin transliteration; do not auto-translate the instruction card (Google Translate would corrupt protocol text).
```

---

## 1. What this product is

**DERES / ድረስ** (“reach them”) is a **voice-first first-aid guide** for an untrained bystander in the first minutes of an emergency, and a **live handoff** for a professional responder.

It is **not**:

- a chatbot that invents medical advice
- an ambulance / dispatch / fleet system
- a patient record or hospital EMR
- a login-walled consumer app for the person in the emergency

**Core loop (this is the product, keep it):**

1. Person speaks or taps.
2. Backend extracts **facts** (collapsed? breathing?).
3. A **published protocol** decides the next **one** line to say.
4. App **speaks that line verbatim** and shows the same words on screen.
5. Person confirms. State updates. Repeat.
6. Responders see a structured picture of what is known, unknown, and already done.

The LLM **understands language**. It **never writes the instruction**. If the designer puts a “helpful AI summary” on the emergency screen, that is a safety bug.

---

## 2. Who uses it

| Persona | Device | Stress | Job |
|---|---|---|---|
| **Bystander** | Phone, often one hand, outdoors, noisy | Extreme | Keep someone alive until 907 / responders arrive |
| **Responder** | Phone or laptop, trained | High but professional | See what happened before they arrive / on arrival |

No account for the bystander. Session is anonymous. Language is chosen once and **locked for that emergency** (changing language mid-CPR is dangerous).

Responder signs in with a shared invite (hackathon/demo), not Google login.

---

## 3. System architecture (only what affects UI)

```text
┌─────────────┐     transcript or      ┌──────────────────┐
│  Phone PWA  │     button press       │  DERES API       │
│  (Vite/React│ ───────────────────►   │  Express         │
│   + Voxide) │                        │                  │
│             │ ◄───────────────────   │  LLM → facts     │
│  mic / TTS  │   { reply, phase,      │  Protocol engine │
│  huge buttons│    capability }       │  Incident state  │
└─────────────┘                        │  Socket.IO live  │
                                       └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │ Responder UI     │
                                       │ handoff + list   │
                                       └──────────────────┘
```

**Voice:** Voxide (Gemini Live in the browser) hears and speaks. DERES tells it the exact sentence (`sayExactly`). If Voxide is missing, a push-to-talk fallback can send audio to the server. If speech dies entirely, **buttons still run the protocol**.

**Offline:** If the API is unreachable after start (or start itself fails), the **same protocol runs on the device**. Voice is off. Call 907 stays. Responders will not see those local steps until the phone is back online — the UI must say so honestly.

**Realtime:** Socket.IO updates the responder dashboard. The bystander screen does not need a live map of other users.

**Languages:** `en`, `am`, `om`. Protocol prompts exist in all three. UI chrome is translated in `emergencyCopy`. Medical lines come from the protocol object, not from the designer’s copy deck.

---

## 4. Information architecture

Two apps in one PWA. **Different visual systems.** Do not share the emergency “panic” look with the responder dashboard.

```text
Bystander                         Responder
─────────                         ─────────
/                                 /responder          list
/emergency/language               /responder/incidents/:id   handoff
/emergency/session  ← MAIN
/emergency/:id/timeline   (stub — design it)
/emergency/:id/summary    (stub — design it)
```

**Primary path (demo and real use):** Start → Language (if first time) → Session until help arrives.

Timeline and summary are specified but currently placeholders. Design them: after “help arrived”, a short **what we did** screen the bystander can hold up to a responder.

---

## 5. Screen inventory (required content, free layout)

### 5.1 Start (`/`)

**Must have**

- One primary action: Start emergency
- Language currently in use (name in its own script), tappable to change **before** an emergency
- No signup, no onboarding carousel, no “learn more”

**Must not**

- Ask for camera, contacts, or a tutorial first
- Hide the start button below a fold of marketing

### 5.2 Language (`/emergency/language`)

- Three full-width choices: English / አማርኛ / Afaan Oromoo
- Each label **in that language’s script**
- Selecting can immediately start the emergency (`?start=1`) or just remember the language
- Disabled/pending state while the incident is being created

### 5.3 Active emergency (`/emergency/session`) — **the product**

This is 90% of the UX. Treat it as a **voice appliance**, not a web page.

**Always visible during an emergency**

| Element | Why |
|---|---|
| Current protocol line (question or instruction) | The only medical text. Verbatim. `lang=` set. |
| Call 907 | Ethiopia ambulance short code. `tel:907`. Never more than one tap away. |
| Mic control | Primary. See voice phases below. |
| Fallback buttons | Depend on step type (table below) |
| Elapsed time since start | Orientation under stress |
| Connection honesty | Offline / voice down — not a spinner forever |

**Step types → buttons** (layout can change; the set cannot)

| Step kind | Meaning | Buttons |
|---|---|---|
| Opening (no protocol yet) | What happened? | Collapsed / not responding · Something else |
| `question` / `assessment` | One clinical yes/no | Yes · No · Not sure |
| `action` / `escalation` | Do this now | Done · I can’t · Call 907 (especially on call-EMS) |
| `exit` | Stay with them | Help arrived |

Secondary: **Repeat** (hear/show the line again). Not equal to the primary action.

**Desktop only:** a side rail with ambulance status, location share status, and step progress. **Mobile:** do not steal vertical space from the instruction. Progress can be a thin ticks bar or a “Step 3 of 6” caption, not a full checklist covering the prompt.

**Something else:** this build only guides an **unresponsive adult**. Other emergencies → full-screen call 907, no fake protocol.

### 5.4 Voice phases (mic)

Never convey phase by colour alone (colour-blind + sunlight). Pair icon + short text + motion.

| Phase | Person should understand | Mic does |
|---|---|---|
| `idle` | Tap to speak | Start |
| `listening` | Speak now | Stop / send |
| `processing` | App is thinking — wait | Disabled |
| `speaking` | App is talking | Interrupt (barge-in) |
| `awaiting_confirmation` | Say “done” when finished | Speak |
| `error` | Voice broken; use buttons | Retry |

Hints under the mic, from the step: e.g. “Say yes, no, or not sure”.

Live loudness (a ring or bars driven by real mic level) is good; fake looping animation that ignores the room is not.

### 5.5 End / help arrived

Calm confirmation. Option to start a new emergency. Do not keep shouting “call 907” as the only message.

### 5.6 Responder list

- Filter: live incidents only (active / escalated)
- Sort: escalated first, then newest
- Each row: emergency type, time ago, location if any, status, escalation
- Connection badge (socket live vs polling)

### 5.7 Responder incident / handoff

Read order is safety-critical:

1. **Warnings** (unresponsive, not breathing, call not confirmed)
2. **Critical facts** with **certainty** — “unknown” is a first-class value, not empty UI
3. Location
4. Actions given vs confirmed
5. Timeline (newest first is OK for responders)

Do not mix this with the bystander’s huge-type emergency UI.

---

## 6. Protocol the UI must walk (current MVP)

Only one published protocol: **unresponsive adult** (ERC BLS, compression-only for untrained helpers).

Usual path (it **branches**):

1. Check response — *Tap their shoulders and shout. Are they responding?*
2. Call emergency services — *Call now. Speaker if you can.*
3. Open the airway
4. Check breathing
5. CPR (chest compressions) **or** recovery position
6. Wait with them

If they **are** responding, the protocol **exits**. Do not continue CPR UI.

The **words on the card are the protocol’s `prompt[language]`**, not designer rewrite. You may style them. You may not shorten, joke, or “make friendlier”.

---

## 7. Locked product rules (do not “improve” these)

1. **One thing at a time.** No dashboard of all first-aid steps as the main view.
2. **Verbatim medical speech = verbatim on-screen text.**
3. **Buttons equal voice.** Every spoken turn has a tap equivalent. Mic failure is not a dead end.
4. **Call 907 is always available** during an emergency, including when voice errors and when offline.
5. **Honesty.** Unknown location, unknown breathing, mic denied, offline — say it. Do not fake a live ambulance map.
6. **No auto-translate** on protocol text (Chrome Translate corrupts Amharic medical lines). Mark that region `notranslate`.
7. **Permission just-in-time.** Mic: when they tap speak. Location: quietly in the background or on first session, with a retry if denied. Never a five-permission splash.
8. **Confirm dangerous actions.** Placing the call is explicit. The app may open the dialer; it must not claim “ambulance is on the way” unless the user confirmed the call step.
9. **Languages are first-class**, not a settings afterthought. Amharic is Ge’ez script. Oromo is Latin orthography, not “Amharic-ish”.

---

## 8. States and empty/error UX

Design each explicitly:

| State | Bystander |
|---|---|
| Creating incident | Full-screen “Starting…” — still show Call 907 if it takes >1s |
| API down at start | Continue **locally**; banner that responders cannot see this yet |
| API down mid-session | Same; buttons keep advancing the protocol |
| Mic denied / no Voxide key | Hide or disable mic; buttons remain; one line of explanation |
| Recognition failed / silence | Protocol “say that again” line + keep buttons |
| Unsupported emergency | Only call 907 |
| Location denied | Card: “Tell the operator where you are” |

Responder: unauthorized → sign-in. Empty list → “No live incidents”. Socket down → badge, still show last payload.

---

## 9. Content the designer does **not** invent

Locked in code / protocol (use as-is in mockups):

**English examples**

- Greeting: “I'm DERES. I'll guide you one step at a time.”
- Check response: “Tap their shoulders and shout. Are they responding to you?”
- Call EMS: “Call emergency services now. Put the phone on speaker if you can.”
- Ambulance number: **907** (fire 939, police 991 exist but the emergency CTA is ambulance)

For Amharic and Afaan Oromo, pull strings from `apps/web/src/i18n/emergencyCopy.ts` and `packages/protocols/src/unconsciousAdult.ts`. Do not Google-translate medical lines for the mock.

Chrome/UI labels (Yes, Done, Repeat, Help arrived) **may** be restyled and can be copy-tuned with a native speaker. Protocol sentences may not.

---

## 10. Technical constraints for layout

| Constraint | Implication |
|---|---|
| PWA, phone in a pocket | Thumb zone; no hover-only |
| Voice + speaker | Don’t cover the instruction with a modal the moment TTS starts |
| `tel:907` | Real link, looks like a button |
| Safe areas | Notch / home indicator |
| Contrast | Outdoor; WCAG AA at least, AAA for the instruction |
| Reduced motion | Pulse on “listening” must have a static equivalent |
| RTL | Not required (none of the three languages are RTL) |
| Desktop session | Optional two-column: instruction | live context |

Suggested breakpoints: **390** (primary), **768**, **1280**.

---

## 11. Suggested file structure in Figma

- Cover + principles
- Bystander flow (happy path, 6 frames)
- Voice phase sheet (6 mic states)
- Offline / mic-denied / unsupported
- Language + start
- Help arrived + summary (new)
- Responder list + handoff
- Type scale (instruction vs chrome)
- Colour (bystander vs responder — two themes)
- Component set: Button, Mic, Banner, Fact (with certainty), Dial 907

Deliver **frames named after routes and states**, e.g. `E3 Session / action / speaking / om`.

---

## 12. What is wrong with the current UI (so you don’t repeat it)

This is product critique, not a request to polish:

- Looks like a generic dashboard (cards, side panel, lots of equal-weight text) instead of one life-saving line.
- Mic is a small control competing with many buttons.
- Progress list and “what’s happening” rail argue with the instruction on small screens.
- Visual language is closer to an admin tool than an emergency appliance.
- Responder and bystander share too much chrome.

Redesign should feel like **a calm voice in your hand**, and a **clear ops console** for the professional — two products, one system.

---

## 13. Backend cheat-sheet for prototypes

You do not need to design APIs. If a prototype is wired later:

- `POST /api/incidents` — start
- `POST /api/incidents/:id/voice` — spoken turn → `{ reply, phase, capability: 'place_call' | null }`
- `POST /api/incidents/:id/buttons` — same response shape
- `GET /api/incidents/:id` — state for the session screen
- `GET /api/responder/incidents/:id/handoff` — responder view
- Socket.IO rooms for live responder updates

`capability: 'place_call'` means: after the line is spoken, the app may open the 907 dialer.

---

## 14. Success for this redesign

A first-time person, one-handed, in Amharic, can:

1. Tap start
2. Understand they should talk or tap
3. See/hear exactly one next action
4. Call 907 without hunting
5. Keep going if the mic fails or the network drops

A responder can open an incident and in **five seconds** know: unresponsive?, breathing?, called 907?, where?

If the mock looks like ChatGPT with a green medical theme, it failed.
