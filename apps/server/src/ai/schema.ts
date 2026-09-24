import type {
  AgeGroup,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
} from '@voicesos/shared';

/**
 * What the model is allowed to return.
 *
 * There is no instruction, procedure, or spoken-reply field. The protocol
 * engine supplies those. The model only interprets language into structured
 * facts and a user intent.
 */
export const LlmIntent = {
  ANSWER: 'answer',
  CONFIRM_ACTION: 'confirm_action',
  UNABLE_ACTION: 'unable_action',
  REQUEST_HELP: 'request_help',
  REPEAT: 'repeat',
  UNSUPPORTED: 'unsupported',
  UNKNOWN: 'unknown',
} as const;
export type LlmIntent = (typeof LlmIntent)[keyof typeof LlmIntent];

export const LLM_INTENTS = Object.values(LlmIntent);

export type LlmActionStatus = 'confirmed' | 'unable' | 'skipped';

export interface LlmExtraction {
  emergencyType: EmergencyType | null;
  emergencyTypeConfidence: number;
  ageGroup: AgeGroup | null;
  consciousness: ConsciousnessState | null;
  breathing: BreathingState | null;
  peopleAffected: number | null;
  locationDescription: string | null;
  symptoms: string[];
  observations: string[];
  questionAnswer: string | null;
  certainty: Certainty;
  actionStatus: LlmActionStatus | null;
  unsupportedRequest: string | null;
  intent: LlmIntent;
}

export const EXTRACTION_KEYS = [
  'emergencyType',
  'emergencyTypeConfidence',
  'ageGroup',
  'consciousness',
  'breathing',
  'peopleAffected',
  'locationDescription',
  'symptoms',
  'observations',
  'questionAnswer',
  'certainty',
  'actionStatus',
  'unsupportedRequest',
  'intent',
] as const;

/** Keys that mean the model tried to author medical guidance. Reject the turn. */
export const FORBIDDEN_EXTRACTION_KEYS = [
  'instruction',
  'procedure',
  'guidance',
  'diagnosis',
  'treatment',
  'reply',
  'say',
  'tellUser',
  'prompt',
] as const;
