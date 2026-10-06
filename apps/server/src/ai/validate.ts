import {
  AgeGroup,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
} from '@voicesos/shared';
import { AiValidationError } from '../common/errors.js';
import {
  EXTRACTION_KEYS,
  FORBIDDEN_EXTRACTION_KEYS,
  LLM_INTENTS,
  LlmIntent,
  type LlmActionStatus,
  type LlmExtraction,
} from './schema.js';

const ACTION_STATUSES = new Set<LlmActionStatus>(['confirmed', 'unable', 'skipped']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new AiValidationError('Model output is not valid JSON');
  }
  if (!isRecord(parsed)) {
    throw new AiValidationError('Model output must be a JSON object');
  }
  return parsed;
}

function optionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  _path: string,
): T | null {
  if (typeof value !== 'string') return null;
  const normalised = value.trim().toLowerCase().replace(/[\s-]+/g, '_') as T;
  return allowed.includes(normalised) ? normalised : null;
}

const EMERGENCY_SYNONYMS: Record<string, EmergencyType> = {
  collapse: EmergencyType.UNCONSCIOUS,
  collapsed: EmergencyType.UNCONSCIOUS,
  unconscious_adult: EmergencyType.UNCONSCIOUS,
  unresponsive: EmergencyType.UNCONSCIOUS,
  unresponsive_adult: EmergencyType.UNCONSCIOUS,
  not_responding: EmergencyType.UNCONSCIOUS,
  fainted: EmergencyType.UNCONSCIOUS,
  passed_out: EmergencyType.UNCONSCIOUS,
  bleeding: EmergencyType.SEVERE_BLEEDING,
  hemorrhage: EmergencyType.SEVERE_BLEEDING,
  stroke: EmergencyType.SUSPECTED_STROKE,
  allergy: EmergencyType.SEVERE_ALLERGIC_REACTION,
  allergic_reaction: EmergencyType.SEVERE_ALLERGIC_REACTION,
};

/** Models paraphrase the enum. A near-miss maps; anything else is "not established". */
function readEmergencyType(value: unknown): EmergencyType | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const synonym = EMERGENCY_SYNONYMS[key];
  if (synonym) return synonym;
  if (key === EmergencyType.UNKNOWN) return null;
  return (Object.values(EmergencyType) as string[]).includes(key) ? (key as EmergencyType) : null;
}

function optionalString(value: unknown, path: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new AiValidationError(`Invalid ${path}`, { path });
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/** Accepts 0.9, "0.9" and a 0–100 percentage. Missing becomes 0, so the protocol decides. */
function readConfidence(value: unknown): number {
  const number = finiteNumber(value);
  if (number === null) return 0;
  const scaled = number > 1 && number <= 100 ? number / 100 : number;
  if (scaled < 0 || scaled > 1) {
    throw new AiValidationError('emergencyTypeConfidence must be a number between 0 and 1');
  }
  return scaled;
}

/** A count the model could not express cleanly is treated as unknown, not as a failed turn. */
function readPeopleAffected(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = finiteNumber(value);
  if (number === null || number < 1) return null;
  return Math.round(number);
}

/** An intent outside the allowed list becomes unknown, so the protocol repeats instead of failing. */
function readIntent(value: unknown): LlmIntent {
  if (typeof value === 'string' && (LLM_INTENTS as readonly string[]).includes(value)) {
    return value as LlmIntent;
  }
  return LlmIntent.UNKNOWN;
}

function stringList(value: unknown, path: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new AiValidationError(`${path} must be an array of strings`, { path });
  }
  return value.map((item) => item.trim()).filter((item) => item.length > 0);
}

/**
 * Parse and validate model output. Throws {@link AiValidationError} and
 * applies nothing: a bad payload cannot become a partial state update.
 */
export function validateExtraction(raw: string): LlmExtraction {
  const parsed = parseJsonObject(raw);
  const keys = Object.keys(parsed);

  const forbidden = keys.filter((key) =>
    (FORBIDDEN_EXTRACTION_KEYS as readonly string[]).includes(key),
  );
  if (forbidden.length > 0) {
    throw new AiValidationError('Model output tried to author medical guidance', {
      forbidden,
    });
  }

  // Extra keys are dropped. Only keys that would let the model write medical
  // guidance are rejected; a harmless extra field must not fail the turn.
  const confidence = readConfidence(parsed.emergencyTypeConfidence);
  const peopleAffected = readPeopleAffected(parsed.peopleAffected);

  const actionStatus =
    typeof parsed.actionStatus === 'string' && ACTION_STATUSES.has(parsed.actionStatus as LlmActionStatus)
      ? (parsed.actionStatus as LlmActionStatus)
      : null;

  return {
    emergencyType: readEmergencyType(parsed.emergencyType),
    emergencyTypeConfidence: confidence,
    ageGroup: optionalEnum(parsed.ageGroup, Object.values(AgeGroup), 'ageGroup'),
    consciousness: optionalEnum(parsed.consciousness, Object.values(ConsciousnessState), 'consciousness'),
    breathing: optionalEnum(parsed.breathing, Object.values(BreathingState), 'breathing'),
    peopleAffected: (peopleAffected as number | null | undefined) ?? null,
    locationDescription: optionalString(parsed.locationDescription, 'locationDescription'),
    symptoms: stringList(parsed.symptoms, 'symptoms'),
    observations: stringList(parsed.observations, 'observations'),
    questionAnswer: optionalString(parsed.questionAnswer, 'questionAnswer'),
    certainty:
      typeof parsed.certainty === 'string' &&
      (Object.values(Certainty) as string[]).includes(parsed.certainty)
        ? (parsed.certainty as Certainty)
        : Certainty.UNKNOWN,
    actionStatus: (actionStatus as LlmActionStatus | null | undefined) ?? null,
    unsupportedRequest: optionalString(parsed.unsupportedRequest, 'unsupportedRequest'),
    intent: readIntent(parsed.intent),
  };
}

export function emptyExtraction(overrides: Partial<LlmExtraction> = {}): LlmExtraction {
  return {
    emergencyType: null,
    emergencyTypeConfidence: 0,
    ageGroup: null,
    consciousness: null,
    breathing: null,
    peopleAffected: null,
    locationDescription: null,
    symptoms: [],
    observations: [],
    questionAnswer: null,
    certainty: Certainty.UNKNOWN,
    actionStatus: null,
    unsupportedRequest: null,
    intent: LlmIntent.UNKNOWN,
    ...overrides,
  };
}
