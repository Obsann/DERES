# Sources bibliography

Citations used in the Task 38 research trail. Prefer primary links. Mark access notes honestly.

## Core Ethiopian / scene-care evidence

1. **Anlaye et al.** Pre-hospital Care to Trauma Patients in Addis Ababa, Ethiopia: Hospital-based Cross-sectional Study. *Ethiop J Health Sci.* 2021.  
   - PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC8843143/  
   - DOI: https://doi.org/10.4314/ejhs.v31i5.14  
   - Used for: relatives 45% / bystanders 33.9% / ambulance staff 17.4% among scene caregivers; lack of knowledge 61.2%.

2. **Gebreegziabher et al.** Trends and barriers of emergency medical service use in Addis Ababa, Ethiopia. *BMC Emergency Medicine* (2019).  
   - https://bmcemergmed.biomedcentral.com/articles/10.1186/s12873-019-0242-5  
   - Used for: EMS access barriers; language association context.

3. **Related RTI / ambulance care (Addis Ababa).** Role of pre-hospital ambulance care in road traffic injuries. *Emergency Care Journal* (2022).  
   - https://doi.org/10.4081/ecj.2022.10745  
   - Used for: bystander extrication patterns; prehospital care mix.

## Ethiopian digital EMS ecosystem

4. **Ethiopian Ambulance Alliance Network / HEARTS**  
   - https://www.heartscare.net/  
   - Used for: coordinated digital EMS infrastructure exists; DERES should not rebuild it.

5. **EAAN / HEARTS implementation report (2026)** — listed in team specification  
   - https://www.medrxiv.org/content/10.64898/2026.07.22.26358728  
   - Note: verify citation details when annotating in Scholarxiv.

6. **Addis Ababa EMS assessment (2026)** — listed in team specification  
   - https://www.sciencedirect.com/science/article/pii/S2949916X26000174  
   - Note: may be paywalled; cite from accessible abstract/full text only after reading.

## International emergency platforms (competitive context)

7. **RapidSOS UNITE** — https://rapidsos.com/public-safety/unite/  
8. **RapidSOS Transcription & Translation** — https://rapidsos.com/public-safety/transcription-translation/  
9. **RapidSOS Harmony** — https://rapidsos.com/public-safety/harmony/  

Used for: dispatcher-centric capabilities DERES does not replace.

## Internal project sources

10. `docs/Team_COD1_DERES_Full_Engineering_Product_Specification.md` — product/architecture Decisions  
11. `docs/api/shared-contracts.md` — Melkamu/Obsan contract agreement  
12. `task.md` / `team_assignments.md` — scope and task verify criteria  

## Verified emergency-speech, LLM-safety, and handoff papers

Abs pages (and the CPR PDF extract) retrieved in this workspace. Cite these. Do **not** cite the denylist below.

13. **Deschamps-Berger, Lamel & Devillers.** Exploring Attention Mechanisms for Multimodal Emotion Recognition in an Emergency Call Center Corpus. *ICASSP 2023*.  
    - https://arxiv.org/abs/2306.07115  
    - Used for: real CEMO emergency calls; audio carries more emotion than text; multimodal fusion gains ~4–9%; emergency speech is noisy and stressed.

14. **Aityan et al.** A Super-Learner with Large Language Models for Medical Emergency Advising (MEDAS). *arXiv preprint*, 2025.  
    - https://arxiv.org/abs/2511.08614  
    - Used for: five LLMs on emergency cases scored ~58–65% diagnostic accuracy; super-learner ~70%; no single model above ~85%. Supports “LLM must not decide.”

15. **Mancheva & Dugdale.** Understanding communications in medical emergency situations. *HICSS* (arXiv:1904.04010).  
    - https://arxiv.org/abs/1904.04010  
    - Used for: CPR-team communication breakdowns; unstructured talk increases no-flow time; structured messages + check-back support mutual situation awareness. Supports structured handoff.

16. **Zhong, Qin, Huang & Li.** Causal Inference for Chatting Handoff. *arXiv preprint*, 2022.  
    - https://arxiv.org/abs/2210.02862  
    - Used for: when to hand off from machine to human in conversation systems — escalate rather than improvise.

### Teammate-verified list (metadata confirmed; abs/PDF not re-opened in this pass)

Safe to queue for reading. Do not put numbers from these on the public site until someone on the team opens the abs/PDF locally:

Golding et al. [0810.3671](https://arxiv.org/abs/0810.3671); Gligorijevic et al. [1804.03240](https://arxiv.org/abs/1804.03240); Akaybicen et al. [2412.16341](https://arxiv.org/abs/2412.16341); Zhang [2601.15306](https://arxiv.org/abs/2601.15306); Young & Matthews [2605.03998](https://arxiv.org/abs/2605.03998); Sebastian et al. [2509.26351](https://arxiv.org/abs/2509.26351); Yan et al. [2410.21348](https://arxiv.org/abs/2410.21348); Menzies et al. [2408.09193](https://arxiv.org/abs/2408.09193); Naim et al. [2109.04646](https://arxiv.org/abs/2109.04646); Goel & Beigi [2003.07996](https://arxiv.org/abs/2003.07996); Milner et al. [2207.02104](https://arxiv.org/abs/2207.02104); Wongpithayadisai et al. [2507.09618](https://arxiv.org/abs/2507.09618); Lin [1701.04126](https://arxiv.org/abs/1701.04126); Newton et al. [2109.03789](https://arxiv.org/abs/2109.03789); Matteson et al. [1107.4919](https://arxiv.org/abs/1107.4919).

## Not verified — do not download or cite

These arXiv IDs appeared in earlier search logs and could **not** be re-retrieved with live metadata. Do not put them on the landing page, in Scholarxiv, or in a demo claim until an abs page is confirmed:

`2312.09150`, `2008.05064`, `2511.14119`, `2403.06734`, `2604.25415`, `2510.21228`, `2511.20654`, `2412.16176`, `2309.08865`, `2301.00646`, `2110.14957`, `2308.14894`.

## WHO / IFRC / TECC first-minute map (encoded 2026-10-07)

17. **WHO CFAR Pocket Guide** — https://cdn.who.int/media/docs/default-source/integrated-health-services-%28ihs%29/csy/cfar-pocketguide.pdf  
    Used for: bystander pressure, packing, tourniquet, spine precaution, SBAR-style handoff framing.

18. **WHO Prehospital Emergency Care: Clinical Protocols** — https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/prehospital-rotocols.pdf  
    Used for: scene-specific algorithms (choking, burns, stroke, injured patient). First-minute steps only.

19. **IFRC International First Aid Guidelines 2020** — https://www.ifrc.org/sites/default/files/2022-02/EN_GFARC_GUIDELINES_2020.pdf  
    Used for: burns cool 10–20 min; bleeding direct pressure; education that one script is not enough.

20. **TECC Guidelines for Active Bystanders (2020)** — https://www.c-tecc.org/images/Archived_TECC_Guidelines_for_Active_Bystanders_Final_2020_1_2.pdf  
    Used for: tourniquet high on the limb, over clothes if needed, never release.

FAST accuracy numbers and named RCTs (PATTS, Goolsby, Delaney) stay off the public site until those PDFs are opened locally. See `scenario-protocols.md`.

## Citation hygiene

- Quote statistics only from sources the team has opened.
- If a link is inaccessible, mark **Hypothesis / unverified** until retrieved.
- Protocol clinical content (Task 6) needs its own authoritative first-aid citations — do not invent them here.
