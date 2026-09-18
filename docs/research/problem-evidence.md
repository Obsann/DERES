# Problem evidence — bystander-first emergency gap

**Labels used below:**  
- **Research** — backed by cited literature or named systems  
- **Decision** — explicit team/product choice  
- **Hypothesis** — plausible but not proven; must not be oversold in demo

## 1. The core problem (Research + Decision)

Emergency systems usually optimise for getting **professional help to the scene**.  
There is still a gap: what does the **person already there** do safely in the first minutes?

**Decision:** ድረስ (DERES) targets that gap. Primary user = bystander / first person at the scene. Secondary user = responder receiving structured handoff.

**Not the problem we claim to own:** nationwide dispatch, ambulance fleet management, hospital EMR, AI diagnosis.

## 2. Ethiopian / Addis Ababa evidence (Research)

### Pre-hospital trauma care providers (Addis Ababa)

Hospital-based cross-sectional study of trauma patients presenting to Addis Ababa Burn Emergency and Trauma (AaBET) Hospital ED (April–May 2020, n=238 interviewed):

| Finding | Value | Source |
|---|---|---|
| Some form of care at the scene | 46.2% (110/238) | [PMC8843143](https://pmc.ncbi.nlm.nih.gov/articles/PMC8843143/) |
| Care by relatives (among scene caregivers) | 45% | same |
| Care by bystanders | 33.9% | same |
| Care by trained ambulance staff | 17.4% | same |
| Main reason care was **not** provided | Lack of knowledge 61.2% | same |
| Lack of equipment (among non-care reasons) | 19.4% | same |
| Arrival within one hour from scene | 56.1% | same |
| Ambulance as transport from scene | 22.7% (taxi 32.4% most common) | same |

**Product implication (Decision):** Relatives and bystanders are already first responders in practice. The limiting factor is often **knowledge**, which matches a guided, protocol-controlled assistant better than “call an ambulance only.”

### Broader EMS context (Research)

- Addis Ababa EMS / ambulance-use studies report late arrival past the “golden hour,” high family accompaniment, and language/companion factors affecting ambulance use ([BMC Emerg Med 2019](https://bmcemergmed.biomedcentral.com/articles/10.1186/s12873-019-0242-5); RTI ambulance care work such as [ECJ 2022](https://doi.org/10.4081/ecj.2022.10745)).
- Ethiopia is building coordinated digital emergency infrastructure (e.g. HEARTS / Ethiopian Ambulance Alliance Network — see [heartscare.net](https://www.heartscare.net/) and related EAAN/HEARTS reports listed in `sources.md`).

**Product implication (Decision):** DERES must **not** rebuild HEARTS/RapidSOS-class dispatch platforms. It should sit beside them as **scene-side guidance + structured handoff**.

## 3. Target users and contexts (Decision)

| User | Role |
|---|---|
| Primary | Stressed bystander; may have hands occupied; may prefer speech over reading |
| Secondary | Emergency responder using summary, timeline, uncertainty, handoff |
| Future (out of MVP) | Schools, workplaces, security orgs, transport, events, humanitarian orgs |

**MVP emergency contexts (Decision):** one carefully scoped protocol scenario first (engineering spec §10 candidates: unconscious/collapse, severe bleeding, choking, burns, suspected stroke, seizure, severe allergic reaction). Final pick requires authoritative first-aid source (Task 6).

## 4. Exact product gap (Decision, grounded in Research)

| Existing systems tend to cover | DERES covers |
|---|---|
| Call-taking, location, dispatch, professional tools | Guiding the untrained person **at the scene** |
| Transcription/translation for dispatchers (e.g. RapidSOS) | Voice for the bystander + controlled instructions |
| Ambulance / EMS coordination (e.g. HEARTS) | Structured incident memory → responder handoff |

**One-sentence gap statement:**  
*Untrained people are already providing prehospital care in Addis Ababa; lack of knowledge is the top barrier; DERES aims to reduce that barrier with voice + protocol-safe guidance without replacing EMS platforms.*

## 5. Honesty constraints (Decision)

- Hackathon prototype ≠ clinical product.
- Any real deployment needs clinical validation, EMS coordination, privacy/security review, and regulatory oversight (engineering spec closing note).
- Demo must not claim live emergency-service integration that does not exist.
