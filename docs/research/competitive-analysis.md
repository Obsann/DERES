# Competitive analysis — Task 39

**Product:** ድረስ (DERES) · Team COD1 · STARK Hackathon 2026  
**Verify:** the team can explain differentiation **without claiming existing platforms do not exist**.

Companion: Task 38 brief in [`competitive-context.md`](./competitive-context.md).

---

## 1. How to read this document

| Column | Meaning |
|---|---|
| **Exists** | Honest acknowledgment of real products/systems |
| **Optimises for** | Their primary job |
| **Gap vs DERES** | What they usually do *not* fully solve for our bystander thesis |
| **DERES stance** | Replace / complement / ignore for MVP |

Categories screened (from engineering spec §34 and `task.md` Phase 1):

1. Emergency-response / dispatch / PSAP data platforms  
2. Ethiopian emergency / ambulance digital systems  
3. First-aid / first-responder applications  
4. Voice-AI / AI first-aid assistants  
5. Multilingual emergency communication tools  
6. Generic LLM chat and clinical decision-support (boundary check)

---

## 2. Competitor / system matrix

### 2.1 Emergency data & dispatch platforms

| System | Exists | Optimises for | Gap vs DERES thesis | DERES stance |
|---|---|---|---|---|
| **RapidSOS UNITE** | Yes — [rapidsos.com/unite](https://rapidsos.com/public-safety/unite/) | Delivering richer data into public-safety / PSAP workflows | Built for **professionals and call centers**, not guiding an untrained bystander through protocol steps | **Complement** — do not rebuild |
| **RapidSOS Harmony** | Yes — [rapidsos.com/harmony](https://rapidsos.com/public-safety/harmony/) | Coordinating emergency data across agencies | Same: agency coordination, not scene-side first guidance | **Complement** |
| **RapidSOS Transcription & Translation** | Yes — [product page](https://rapidsos.com/public-safety/transcription-translation/) | Multilingual support for emergency **communications staff** | Translation for dispatchers ≠ bystander voice coach with protocol safety | **Complement** (different user) |

**Takeaway:** RapidSOS-class products prove the market for emergency AI/data is real. DERES’s gap is **bystander guidance + structured handoff**, not PSAP data plumbing.

### 2.2 Ethiopian emergency / ambulance digital systems

| System | Exists | Optimises for | Gap vs DERES thesis | DERES stance |
|---|---|---|---|---|
| **HEARTS / Ethiopian Ambulance Alliance Network (EAAN)** | Yes — [heartscare.net](https://www.heartscare.net/) | Coordinated ambulance / emergency network digital infrastructure | Coordinates **services**; does not replace knowledge gaps of relatives/bystanders at the scene ([PMC8843143](https://pmc.ncbi.nlm.nih.gov/articles/PMC8843143/)) | **Complement** — never claim to replace HEARTS |
| Local EMS / fire & ambulance authorities (e.g. Addis Ababa prehospital providers) | Yes (documented in EMS literature) | Transport and professional prehospital care | Low ambulance utilization and knowledge barriers remain (Task 38 evidence) | **Complement** |

**Takeaway:** Ethiopia already has an evolving digital EMS ecosystem. DERES must sit **beside** it as scene-side assistance.

### 2.3 First-aid / first-responder apps

| System | Exists | Optimises for | Gap vs DERES thesis | DERES stance |
|---|---|---|---|---|
| **IFRC / Red Cross First Aid apps** (e.g. Australian Red Cross / IFRC app) | Yes — [redcross.org.au/firstaid/firstaidapp](https://www.redcross.org.au/firstaid/firstaidapp/) | Evidence-based topic guides, offline content, emergency numbers | Mostly **browse/read** guidance; not continuous voice dialogue with live incident state + responder handoff | **Learn from** content discipline; do not copy as product |
| **St John First Responder** (e.g. WA) | Yes — app + [feature docs](https://www.stjohnwa.com.au/online-resources/st-john-first-responder-app/features) | Guides, AED maps, alerting **trained** community responders | Targets qualified first aiders / CFR networks, not untrained bystanders in Ethiopian languages | **Different user**; complementary idea (trained responders) |
| Generic first-aid reference apps | Many | Static checklists and articles | Weak on voice-first, state memory, uncertainty, handoff | Overlap on “content”; DERES differs on **interaction + safety architecture** |

**Takeaway:** First-aid apps validate demand for guidance. DERES differentiates on **voice + state + protocol engine + handoff**, not on being “another article library.”

### 2.4 Voice-AI / AI first-aid assistants

| System | Exists | Optimises for | Gap vs DERES thesis | DERES stance |
|---|---|---|---|---|
| **Ready First Aide** | Yes — [readyfirstaide.com](https://readyfirstaide.com/) | AI voice/tap step-by-step first aid; many procedures; multi-language marketing | May emphasize breadth of procedures; DERES deliberately limits MVP to **protocol-bounded** scenarios with explicit uncertainty + responder handoff | **Competitor in voice-first aid**; differentiate on protocol safety + Ethiopian context + handoff |
| **AidSnap** | Yes — [aidsnap.com](https://www.aidsnap.com/) | AI chat/voice first aid; some claim offline / vision features | Open-ended AI assistance risk unless strongly protocol-gated; not Ethiopia/EMS-handoff focused | **Competitor class**; we must not ship unrestricted AI chat |
| Other “AI emergency assistant” prototypes | Emerging | Hands-free coaching narratives | Often thin on published protocol governance, uncertainty model, or local EMS integration story | Monitor; do not deny they exist |

**Takeaway:** Voice-AI first aid is an active category. Claiming “we are the first AI for emergencies” is **false**. Claiming our **combination** (bystander + protocol boundary + state + Ethiopian languages + handoff) is the honest pitch.

### 2.5 Multilingual emergency communication

| System | Exists | Optimises for | Gap vs DERES thesis | DERES stance |
|---|---|---|---|---|
| RapidSOS transcription/translation | Yes | Call-taker / PSAP multilingual support | Not bystander coaching in Amharic / Afaan Oromo with local protocols | Complement |
| Consumer voice assistants | Yes | General tasks | Not emergency-protocol safety | Out of scope / unsafe substitute |
| Local human interpreters / call-center language support | Yes (operational) | Live human mediation | Not always available in the first minutes at scene | DERES aims to help **before** that arrives |

### 2.6 Generic LLM chat & clinical decision support

| System | Exists | Optimises for | Gap vs DERES thesis | DERES stance |
|---|---|---|---|---|
| Consumer LLMs (ChatGPT-class apps) | Yes | Open-ended Q&A | Can hallucinate medical steps; no DERES-style mandatory protocol gate | **Explicitly not our architecture** |
| Clinical CDSS / hospital tools | Yes (enterprise) | Clinician decision support | Wrong user; regulated clinical context | **Out of MVP**; do not impersonate |

---

## 3. Feature comparison (MVP lens)

| Capability | RapidSOS-class | HEARTS / EAAN | Red Cross–style apps | Voice-AI first-aid apps | **DERES MVP aim** |
|---|---|---|---|---|---|
| Bystander as primary user | Rarely | No | Partially | Often | **Yes** |
| Voice-first interaction | For staff / data | No | Rarely | Often | **Yes** |
| Protocol-bounded AI (hard safety gate) | N/A / different | N/A | Content curated, usually not LLM | Varies — often weak public docs | **Yes (required)** |
| Structured emergency state + uncertainty | Incident data for PSAPs | Operational state | Little | Varies | **Yes** |
| Responder handoff from conversation | Rich data to PSAPs | EMS workflows | No | Rarely | **Yes (structured summary)** |
| Ethiopian language focus | Possible via partners | Local ops | Usually other locales | Marketing-dependent | **Yes (gated on quality)** |
| Ambulance dispatch / fleet | Adjacent / partners | **Core** | No | Sometimes “call 911” | **No — out of scope** |
| Offline full LLM | N/A | N/A | Offline **content** common | Some claim on-device | **No for MVP** |

---

## 4. What DERES does **not** attempt to replace

Recorded for Task 39 verify and demo scripts:

1. RapidSOS UNITE / Harmony / PSAP data platforms  
2. HEARTS / EAAN ambulance-network coordination  
3. National emergency calling infrastructure  
4. Hospital / EMR systems  
5. Ambulance fleet management and tracking  
6. Professional clinical diagnosis / CDSS  
7. Unrestricted medical chatbot  
8. Trained community-first-responder dispatch networks (e.g. St John CFR) — different user  
9. Payment, identity-heavy consumer accounts (MVP stays anonymous session-first)

These match engineering spec §5 and §29 “WILL NOT BUILD.”

---

## 5. Differentiation one-pager (use in demos)

**Existing platforms are real.** Dispatch tools, EMS networks, first-aid apps, and voice-AI first-aid products already exist.

**DERES focuses on one gap:**  
the untrained person already at the scene who lacks knowledge (supported by Addis Ababa prehospital evidence), needs **voice**, must receive **only protocol-allowed** guidance, and should leave responders a **structured handoff** — with Ethiopian language ambition.

**Pitch line (honest):**  
*Not “the only emergency AI.” The bystander-first, protocol-safe, state-aware, handoff-producing assistant for the first critical minutes.*

---

## 6. Risks if we ignore competition

| Risk | Mitigation |
|---|---|
| Judges say “RapidSOS already does this” | Clarify dispatcher vs bystander; show protocol + handoff |
| Judges say “first-aid apps already exist” | Show voice + live state + uncertainty + responder view |
| Voice-AI apps look similar | Emphasize hard protocol validation and Ethiopian evidence trail |
| Overclaiming uniqueness | Use this doc; never say competitors don’t exist |

---

## 7. Follow-ups

- [ ] Re-check RapidSOS / HEARTS pages before final demo week (features change)  
- [ ] After Task 6 protocol selection, note which first-aid apps cover the same scenario (content overlap only)  
- [ ] If Voxide languages slip, update multilingual competitive claims  
- [ ] Optional: add a one-slide visual for Samuel Task 36 from §5  

---

## 8. Sources

See [`sources.md`](./sources.md) plus product URLs linked inline above. Competitive claims here are based on public marketing/docs, not reverse-engineering or private access.
