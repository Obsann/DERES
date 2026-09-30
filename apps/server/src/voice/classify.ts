import { Language } from '@voicesos/shared';
import { safePhrases } from '../ai/phrases.js';

export const VoiceFailure = {
  RECOGNITION: 'recognition',
  SILENCE: 'silence',
  TIMEOUT: 'timeout',
  UPSTREAM: 'upstream',
} as const;
export type VoiceFailure = (typeof VoiceFailure)[keyof typeof VoiceFailure];

export const SUPPORTED_VOICE_LANGUAGES = Object.values(Language);
export const LOW_CONFIDENCE = 0.45;

const REPEAT =
  /^(again|repeat|what|pardon|say (that|it) again|please repeat|ድገም|ይድገሙ|ይድገሙት|እንደገና|እንደገና ይበሉ|ምን|irra deebi'?ii?|deebisi|maali?)[.?!።]?$/iu;

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

export interface VoicePhraseSet {
  silence: string;
  timeout: string;
  recognition: string;
  lowConfidence: string;
}

export const VOICE_PHRASES_BY_LANGUAGE: Record<Language, VoicePhraseSet> = {
  [Language.ENGLISH]: {
    silence: 'I did not hear you. Please say that again.',
    timeout: 'I am still here. Tell me what you see.',
    recognition: safePhrases(Language.ENGLISH).sayAgain,
    lowConfidence: 'I am not sure I heard that. Please say it once more.',
  },
  [Language.AMHARIC]: {
    silence: 'አልሰማሁዎትም። እባክዎ እንደገና ይናገሩ።',
    timeout: 'አሁንም እዚህ ነኝ። የሚያዩትን ይንገሩኝ።',
    recognition: safePhrases(Language.AMHARIC).sayAgain,
    lowConfidence: 'በትክክል መስማቴን እርግጠኛ አይደለሁም። እባክዎ አንድ ጊዜ ደግመው ይናገሩ።',
  },
  [Language.AFAAN_OROMO]: {
    silence: "Si hin dhageenye. Maaloo irra deebi'ii dubbadhu.",
    timeout: 'Ammallee asuman jira. Waan argitu natti himi.',
    recognition: safePhrases(Language.AFAAN_OROMO).sayAgain,
    lowConfidence: "Sirriitti dhaga'uu koo hin mirkaneeffanne. Maaloo al tokko irra deebi'ii dubbadhu.",
  },
};

export const VOICE_PHRASES = VOICE_PHRASES_BY_LANGUAGE[Language.ENGLISH];

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
  const phrases =
    input.language && isSupportedVoiceLanguage(input.language)
      ? VOICE_PHRASES_BY_LANGUAGE[input.language]
      : VOICE_PHRASES;

  if (input.timeout) {
    return { action: 'reject', failure: VoiceFailure.TIMEOUT, reply: phrases.timeout };
  }
  if (input.recognitionFailed) {
    return { action: 'reject', failure: VoiceFailure.RECOGNITION, reply: phrases.recognition };
  }

  const transcript = input.transcript?.trim() ?? '';
  if (input.silence || transcript.length === 0) {
    return { action: 'reject', failure: VoiceFailure.SILENCE, reply: phrases.silence };
  }

  if (REPEAT.test(transcript)) {
    return { action: 'repeat' };
  }

  const confidence = input.recognitionConfidence ?? null;
  if (confidence !== null && confidence < LOW_CONFIDENCE) {
    return { action: 'reject', failure: VoiceFailure.RECOGNITION, reply: phrases.lowConfidence };
  }

  return { action: 'process', transcript, confidence };
}
