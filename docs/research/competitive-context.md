# Competitive context (Task 38 brief)

> Full competitor matrix and “features we exclude” live in **Task 39**  
> (`docs/research/competitive-analysis.md` when completed).  
> This file only records the differentiation context required for Task 38’s research trail.

## What exists (Research)

| Category | Examples (non-exhaustive) | What they optimise for |
|---|---|---|
| Emergency data / PSAP tools | RapidSOS UNITE, Harmony, transcription & translation | Dispatcher situational awareness, location, multimedia |
| Ethiopian EMS digital coordination | HEARTS / EAAN | Ambulance / emergency network coordination |
| First-aid apps / content | Various mobile first-aid references | Static guidance, sometimes interactive checklists |
| Generic LLM chat | Consumer AI assistants | Open-ended answers — **not** protocol-bounded emergency care |
| SOS / panic buttons | Many consumer apps | Alerting contacts or services, little guided care |

Sources: RapidSOS product pages, HEARTS site, engineering spec §32–§34 — see `sources.md`.

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
- Professional clinical decision support
- An “AI doctor”

## Honesty rule (Decision)

Never claim “nobody has built AI for emergencies.” Claim the **gap**: guided, protocol-safe help for the untrained person already at the scene, with a structured handoff.
