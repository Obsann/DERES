# voice

Voxide integration: voice sessions, speech input, spoken responses, supported
languages, and voice failure states.

**Task:** 9 (Voxide integration).

**Boundary.** This module converts between speech and text and manages the
session. It does not interpret meaning (`ai/`) or decide what to say
(`protocols/`).

Must handle recognition failure, silence and timeouts, repeat requests, and
interruptions. Spoken responses stay short, action-oriented, and ask one
critical question at a time.

Audio is not persisted — only transcripts (specification section 18).
