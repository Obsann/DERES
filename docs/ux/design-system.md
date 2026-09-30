# ድረስ (DERES) — Design System

**Task:** 31 (Design system & shared UI kit)
**Code:** `apps/web/src/styles/tokens.css`, `apps/web/src/styles/ui.css`, `apps/web/src/components/ui/`
**Live reference:** run the web app and open `/design`.

Build screens from these components. If a screen needs something the kit does not
have, add it to the kit rather than styling it inline.

## Principles

1. **One thing at a time.** An emergency screen has one instruction card and one
   set of answer controls.
2. **Never color alone.** Every state has a word and, where it helps, an icon.
   Certainty, voice phase, connection and escalation all follow this.
3. **Red means emergency.** `--d-emergency` and `variant="emergency"` are only for
   *Start emergency*, *Call emergency services* and escalation. Errors that are not
   emergencies use amber (`warning`).
4. **Big enough for shaking hands.** Emergency controls use `size="lg"` (64 px) or
   `size="xl"` (96 px). Dashboard controls are at least 48 px.
5. **Readable outdoors.** All text/background pairs meet WCAG AA; instruction text is
   28–44 px bold.
6. **Calm motion.** The only animation is the listening pulse, and it is replaced by
   a static ring under `prefers-reduced-motion`.

## Tokens

All tokens are CSS custom properties prefixed `--d-`.

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `canvas`, `surface`, `surface-sunken`, `border`, `border-strong` | Page, cards, dividers |
| Text | `ink`, `ink-muted`, `ink-inverse` | Body, secondary, on dark fills |
| Brand | `brand`, `brand-hover` | Primary non-emergency actions (Done, Yes) |
| Emergency | `emergency`, `emergency-soft`, `emergency-ink` | Start, call, escalation only |
| Tones | `success`, `warning`, `info`, `neutral` with `-soft` / `-ink` | Banners and badges |
| Type | `text-xs` … `text-xl`, `text-instruction`, `text-display` | See type scale |
| Space | `space-1` (4 px) … `space-8` (64 px) | Gaps and padding |
| Touch | `touch-min` (48 px), `touch-emergency` (64 px) | Control heights |

### Type

- Font stack starts with system UI fonts and falls back to **Nyala / Noto Sans
  Ethiopic / Abyssinica SIL** so Amharic renders in Ge'ez script. Afaan Oromoo uses
  Latin script and needs nothing extra.
- Set `lang="am"` on Amharic content; `:lang(am)` raises line height to 1.7 because
  Ge'ez glyphs are taller.
- Instruction text: `--d-text-instruction` (fluid 28–44 px, bold, line height 1.2).
- Emergency body: `--d-text-lg` (20 px). Dashboard body: `--d-text-md` (16 px).

## Components

Import from `@/components/ui`.

| Component | Purpose | Key rules |
|---|---|---|
| `Button`, `ButtonLink` | All actions. `ButtonLink` for real links such as `tel:`. | Variants `emergency` / `primary` / `secondary` / `quiet`; sizes `md` / `lg` / `xl`. |
| `InstructionCard` | The current protocol step. | `kind` is the `ProtocolStepKind`; `text` is the server's prompt, never rewritten. Announced to screen readers when it changes. |
| `VoicePhaseIndicator` | Mic button + phase in words. | Driven by `VoiceSessionPhase`. Disabled while `processing`. |
| `Banner` | Escalation, connection and failure messages. | Tones `info` / `warning` / `critical` / `success`. Give each failure one `action`. `critical` uses `role="alert"`. |
| `CertaintyBadge` | Known / Uncertain / Unknown. | Mandatory next to every responder fact. Non-known values use a dashed border as a second cue. |
| `EscalationBadge`, `IncidentStatusBadge`, `ActionStatusBadge`, `ConnectionBadge` | Status labels mapped from shared enums. | Add new enum values here first so every screen stays consistent. |
| `Panel` | Titled responder section. | `emphasis="critical"` for warnings; `emphasis="uncertain"` for the unknowns block. |
| `FactList` | Handoff facts. | Takes `HandoffFact[]` directly; shows value, time established and certainty. |

Layout classes: `d-emergency-layout` (single column, 576 px max, thumb-friendly),
`d-dashboard-layout` (1152 px max), `d-stack`, `d-row`, `d-status-strip`.

## Voice phase copy

| Phase | Label |
|---|---|
| `idle` | Tap to speak |
| `listening` | Listening — speak now |
| `processing` | Thinking… |
| `speaking` | Speaking |
| `awaiting_confirmation` | Say "done" when finished |
| `error` | Voice unavailable |

Localized labels can be passed through the `label` prop.

## Not yet in the kit

- Timeline list component (Task 22 will need it; add it here when built).
- Incident list row for the responder list.
- Localized strings: English copy lives in the components today. When the
  Amharic / Afaan Oromoo prompts land, move copy into a message table.
