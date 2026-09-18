# ai

LLM orchestration: system prompts, state-aware and protocol-aware context,
structured extraction from natural speech, and validation of model output.

**Tasks:** 7 (LLM orchestration service), 8 (AI safety validation pipeline).

**Boundary.** The LLM is a language component, not the medical authority. It
may understand speech, extract structured facts, interpret context, phrase an
approved instruction, and ask for missing information under system rules. It
may not invent a procedure, override a protocol, hide uncertainty, or diagnose.

Every model response passes the full chain before it can reach a user:

```text
LLM output
   -> schema validation
   -> state validation
   -> protocol validation
   -> safety rules
   -> response
```

A failure at any stage rejects the response and falls back to a safe path. It
never partially applies.
