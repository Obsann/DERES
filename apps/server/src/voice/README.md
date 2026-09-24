# voice

Voxide integration: voice sessions, speech input, spoken responses, supported
languages, and voice failure states.

**Task:** 9 (Voxide integration).

**Boundary.** This module converts between speech and text and manages the
session. It does not interpret meaning (`ai/`) or decide what to say
(`protocols/`).

Voxide (browser SDK) captures speech. This server:

```text
POST /api/voice/sessions
POST /api/voice/sessions/:incidentId/turns
```

A turn is classified before any state change:

- silence / empty transcript → ask again
- recognition failure or low confidence → ask again
- timeout → stay on the line
- "repeat" / "say that again" → replay the current protocol prompt
- otherwise → LLM extraction → protocol reply

Spoken responses stay short and come from the protocol or a fixed phrase.
Audio is not persisted — only transcripts.
