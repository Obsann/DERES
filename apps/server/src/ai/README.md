# ai

LLM orchestration: system prompts, state-aware and protocol-aware context,
structured extraction from natural speech, and validation of model output.

**Tasks:** 7 (LLM orchestration service), 8 (AI safety validation pipeline).

**Boundary.** The LLM is a language component, not the medical authority. It
may understand speech, extract structured facts, interpret context, and ask
for missing information under system rules. It may not invent a procedure,
override a protocol, hide uncertainty, or diagnose.

The spoken line after a turn is the current protocol prompt, or a fixed safe
phrase. The model has no `reply` / `instruction` field.

```text
utterance
   -> LLM extraction (JSON)
   -> schema validation
   -> state validation
   -> protocol validation
   -> safety rules
   -> state commands / protocol engine
   -> protocol prompt or safe phrase
```

A failure at any validation stage rejects the whole turn. It never
partially applies. Uncertainty is kept; it is never collapsed into a
known fact.

**Provider.** OpenAI-compatible Chat Completions via `LLM_API_KEY`,
`LLM_BASE_URL`, and `LLM_MODEL`. Tests inject `ScriptedLlmProvider`.
