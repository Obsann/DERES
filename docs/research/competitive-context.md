# Competitive context (Task 38 brief)

> **Full competitor matrix:** [`competitive-analysis.md`](./competitive-analysis.md) (Task 39).  
> This file stays as the short differentiation reminder for the research trail.

## What exists (Research)

| Category | Examples (non-exhaustive) | What they optimise for |
|---|---|---|
| Emergency data / PSAP tools | RapidSOS UNITE, Harmony, transcription & translation | Dispatcher situational awareness, location, multimedia |
| Ethiopian EMS digital coordination | HEARTS / EAAN | Ambulance / emergency network coordination |
| First-aid apps / content | IFRC/Red Cross, St John First Responder | Static/step guides; sometimes trained CFR networks |
| Voice-AI first aid | Ready First Aide, AidSnap, and similar | Voice/tap AI coaching — category exists |
| Generic LLM chat | Consumer AI assistants | Open-ended answers — **not** protocol-bounded emergency care |
| SOS / panic buttons | Many consumer apps | Alerting contacts or services, little guided care |

Sources: RapidSOS product pages, HEARTS site, engineering spec §32–§34 — see `sources.md` and Task 39.

## What DERES claims (Decision)

Differentiation is the **combination**, not any single piece alone:

1. Bystander-first (not dispatcher-first)
2. Voice-first interaction
3. State-aware assistance
4. Protocol-controlled AI (safety boundary)
5. Responder handoff from the conversation
6. Ethiopian language focus (subject to provider quality)

## What DERES does **not** replace (Decision)

- RapidSOS-class public-safety data platforms
- HEARTS / ambulance dispatch networks
- Hospitals / EMR
- Professional clinical decision-support
- An “AI doctor”
- Unrestricted medical chatbot

## Honesty rule (Decision)

Never claim “nobody has built AI for emergencies.” Claim the **gap**: guided, protocol-safe help for the untrained person already at the scene, with a structured handoff.
