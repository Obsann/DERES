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

function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new AiValidationError(`Invalid ${path}`, { path, value });
  }
  return value as T;
}

function optionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): T | null {
  if (value === null || value === undefined) return null;
  return requireEnum(value, allowed, path);
}

function optionalString(value: unknown, path: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new AiValidationError(`Invalid ${path}`, { path });
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
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

  const unknown = keys.filter((key) => !(EXTRACTION_KEYS as readonly string[]).includes(key));
  if (unknown.length > 0) {
    throw new AiValidationError('Model output has unsupported fields', { unknown });
  }

  const confidence = parsed.emergencyTypeConfidence;
  if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new AiValidationError('emergencyTypeConfidence must be a number between 0 and 1');
  }

  const peopleAffected = parsed.peopleAffected;
  if (peopleAffected !== null && peopleAffected !== undefined) {
    if (!Number.isInteger(peopleAffected) || (peopleAffected as number) < 1) {
      throw new AiValidationError('peopleAffected must be a positive integer or null');
    }
  }

  const actionStatus = parsed.actionStatus;
  if (actionStatus !== null && actionStatus !== undefined) {
    if (typeof actionStatus !== 'string' || !ACTION_STATUSES.has(actionStatus as LlmActionStatus)) {
      throw new AiValidationError('Invalid actionStatus', { actionStatus });
    }
  }

  return {
    emergencyType: optionalEnum(parsed.emergencyType, Object.values(EmergencyType), 'emergencyType'),
    emergencyTypeConfidence: confidence,
    ageGroup: optionalEnum(parsed.ageGroup, Object.values(AgeGroup), 'ageGroup'),
    consciousness: optionalEnum(parsed.consciousness, Object.values(ConsciousnessState), 'consciousness'),
    breathing: optionalEnum(parsed.breathing, Object.values(BreathingState), 'breathing'),
    peopleAffected: (peopleAffected as number | null | undefined) ?? null,
    locationDescription: optionalString(parsed.locationDescription, 'locationDescription'),
    symptoms: stringList(parsed.symptoms, 'symptoms'),
    observations: stringList(parsed.observations, 'observations'),
    questionAnswer: optionalString(parsed.questionAnswer, 'questionAnswer'),
    certainty: requireEnum(parsed.certainty, Object.values(Certainty), 'certainty'),
    actionStatus: (actionStatus as LlmActionStatus | null | undefined) ?? null,
    unsupportedRequest: optionalString(parsed.unsupportedRequest, 'unsupportedRequest'),
    intent: requireEnum(parsed.intent, LLM_INTENTS, 'intent'),
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
