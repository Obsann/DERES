import { Language } from '@voicesos/shared';
import { SAFE_PHRASES } from '../ai/phrases.js';

export const VoiceFailure = {
  RECOGNITION: 'recognition',
  SILENCE: 'silence',
  TIMEOUT: 'timeout',
  UPSTREAM: 'upstream',
} as const;
export type VoiceFailure = (typeof VoiceFailure)[keyof typeof VoiceFailure];

export const SUPPORTED_VOICE_LANGUAGES = Object.values(Language);
export const LOW_CONFIDENCE = 0.45;

const REPEAT = /^(again|repeat|what|pardon|say (that|it) again|please repeat)$/i;

export interface VoiceTurnInput {
  transcript?: string | null;
  recognitionConfidence?: number | null;
  language?: string;
  silence?: boolean;
  timeout?: boolean;
  interrupted?: boolean;
  recognitionFailed?: boolean;
}

export type VoiceClassification =
  | { action: 'process'; transcript: string; confidence: number | null }
  | { action: 'repeat' }
  | { action: 'reject'; failure: VoiceFailure; reply: string };

export const VOICE_PHRASES = {
  silence: 'I did not hear you. Please say that again.',
  timeout: 'I am still here. Tell me what you see.',
  recognition: SAFE_PHRASES.sayAgain,
  lowConfidence: 'I am not sure I heard that. Please say it once more.',
} as const;

export function isSupportedVoiceLanguage(value: string): value is Language {
  return (SUPPORTED_VOICE_LANGUAGES as string[]).includes(value);
}

/**
 * Decide whether recognised speech may update the incident.
 *
 * Silence, timeouts, failed recognition and very low confidence must not
 * invent a fact. Repeat requests replay the current protocol prompt.
 */
export function classifyVoiceTurn(input: VoiceTurnInput): VoiceClassification {
  if (input.timeout) {
    return { action: 'reject', failure: VoiceFailure.TIMEOUT, reply: VOICE_PHRASES.timeout };
  }
  if (input.recognitionFailed) {
    return { action: 'reject', failure: VoiceFailure.RECOGNITION, reply: VOICE_PHRASES.recognition };
  }

  const transcript = input.transcript?.trim() ?? '';
  if (input.silence || transcript.length === 0) {
    return { action: 'reject', failure: VoiceFailure.SILENCE, reply: VOICE_PHRASES.silence };
  }

  if (REPEAT.test(transcript)) {
    return { action: 'repeat' };
  }

  const confidence = input.recognitionConfidence ?? null;
  if (confidence !== null && confidence < LOW_CONFIDENCE) {
    return { action: 'reject', failure: VoiceFailure.RECOGNITION, reply: VOICE_PHRASES.lowConfidence };
  }

  return { action: 'process', transcript, confidence };
}
