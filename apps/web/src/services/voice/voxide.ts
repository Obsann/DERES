import { VoxideClient, type VoxideStatus } from '@voxide/react/core';
import {
  Language,
  VoiceSessionPhase,
  type Id,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { emergencyCallHref } from '@/config/emergency';
import { incidentsApi } from '@/services/api';
import { voiceLoopCopy } from '@/services/voice/loopCopy';
import { speak } from '@/services/voice/speech';

/**
 * Tags sent to the live agent. Native audio wants the short code (`am`, `om`).
 * Region tags such as `am-ET` have made sessions go silent.
 */
export const VOXIDE_LANGUAGE: Record<Language, string> = {
  [Language.ENGLISH]: 'en-US',
  [Language.AMHARIC]: 'am',
  [Language.AFAAN_OROMO]: 'om',
};

/**
 * Host-only cue after connect. Never sent to the protocol LLM.
 * English and Afaan Oromoo: the agent speaks the greeting from `sayExactly`.
 * Amharic: the app already spoke with a real Amharic voice; agent stays silent.
 */
export const VOXIDE_OPENING_CUE = '__deres_open__';

export function isVoxideOpeningCue(utterance: unknown): boolean {
  return typeof utterance === 'string' && utterance.trim() === VOXIDE_OPENING_CUE;
}

/**
 * Amharic has a real device/server voice (Geʽez). Afaan Oromoo does not — an
 * English voice reading Oromo spelling is wrong, so Voxide/Gemini speaks it.
 */
export function appSpeaksLanguage(language: Language): boolean {
  return language === Language.AMHARIC;
}

let client: VoxideClient | null | undefined;

/** One client per page load; null when no publishable key is configured. */
export function getVoxideClient(): VoxideClient | null {
  if (client !== undefined) return client;
  const publicKey = import.meta.env.VITE_VOXIDE_PUBLIC_KEY?.trim();
  client = publicKey ? new VoxideClient({ publicKey }) : null;
  return client;
}

export interface DeresVoiceBinding {
  incidentId: Id;
  language: Language;
  onTurn: (turn: VoiceTurnResponse) => void;
  getCurrentInstruction: () => string | null;
  /** App TTS is playing; the session UI should show "speaking". */
  onHostSpeech?: (speaking: boolean, text?: string) => void;
}

function normalizeHeard(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The live mic hears our own speakers; drop that as if the person said nothing. */
function isLikelyEcho(utterance: string, spoken: string): boolean {
  const heard = normalizeHeard(utterance);
  const line = normalizeHeard(spoken);
  if (!heard || !line) return false;
  if (heard.includes(line) || line.includes(heard)) return true;
  const a = heard.slice(0, 48);
  const b = line.slice(0, 48);
  return a.length >= 12 && a === b;
}

function silence(speechLanguage: string) {
  return { sayExactly: '', language: speechLanguage };
}

/**
 * Connects the Voxide agent to the DERES protocol engine.
 *
 * Voxide hears in every language. It also speaks English and Afaan Oromoo.
 * Amharic is spoken by the app (real Geʽez neural voice). Protocol text
 * always comes from the server — never from the model.
 */
export function bindDeresSession(voxide: VoxideClient, binding: DeresVoiceBinding): void {
  const speechLanguage = VOXIDE_LANGUAGE[binding.language];
  const lines = voiceLoopCopy(binding.language);
  const hostVoice = appSpeaksLanguage(binding.language);
  let hostSpeaking = false;
  let lastHostLine = '';
  let echoQuietUntil = 0;

  voxide.setLanguage(speechLanguage);
  voxide.enableMultilingual({ mode: 'strict', supported: [speechLanguage] });

  const speakOnHost = (line: string) => {
    const text = line.trim();
    if (text === '') return;
    hostSpeaking = true;
    lastHostLine = text;
    binding.onHostSpeech?.(true, text);
    void speak(text, binding.language)
      .catch(() => false)
      .finally(() => {
        hostSpeaking = false;
        // Room echo after the clip ends still reaches the mic.
        echoQuietUntil = Date.now() + 700;
        binding.onHostSpeech?.(false);
      });
  };

  voxide.register({
    reportToDeres: {
      description: hostVoice
        ? 'Call this for every thing the person says, and when the app sends the opening cue __deres_open__. Pass the exact string. Do not speak your own sentence. When this returns, if sayExactly is empty stay completely silent and listen. Never invent medical advice.'
        : 'Call this for every thing the person says, and when the app sends the opening cue __deres_open__. Pass the exact string. Do not speak before the tool returns. When this returns, speak sayExactly word for word in the session language, then listen. Do not add, translate, or describe the tool.',
      params: {
        utterance: {
          type: 'string',
          required: true,
          description: "The user's exact words, or the opening cue __deres_open__.",
        },
      },
      handler: async ({ utterance }: Record<string, unknown>) => {
        if (isVoxideOpeningCue(utterance)) {
          if (hostVoice) return silence(speechLanguage);
          return { sayExactly: lines.greeting, language: speechLanguage };
        }

        const heard = typeof utterance === 'string' ? utterance.trim() : '';
        if (hostSpeaking || Date.now() < echoQuietUntil || isLikelyEcho(heard, lastHostLine)) {
          return silence(speechLanguage);
        }

        const turn = await incidentsApi.voiceTurn(binding.incidentId, {
          transcript: heard,
          language: binding.language,
        });
        binding.onTurn(turn);

        if (hostVoice) {
          speakOnHost(turn.reply);
          return silence(speechLanguage);
        }
        return { sayExactly: turn.reply, language: speechLanguage };
      },
    },
    callEmergencyServices: {
      description: 'Open the phone dialer to call the ambulance when the user asks to call for help.',
      requireConfirmation: true,
      handler: () => {
        window.location.href = emergencyCallHref;
        return { status: 'dialer_opened' };
      },
    },
  });

  voxide.bindState(() => ({
    app: 'DERES emergency first-aid guidance',
    language: speechLanguage,
    openingLine: lines.greeting,
    currentInstruction: binding.getCurrentInstruction(),
    spokenBy: hostVoice ? 'host_app' : 'voxide',
    rule: hostVoice
      ? 'You are DERES. Never give medical advice of your own. Never speak aloud. Only call reportToDeres and then listen. The host app speaks every line.'
      : 'You are DERES. Never give medical advice of your own. Only speak text returned by reportToDeres as sayExactly. After the greeting, listen.',
  }));
}

export function voxidePhase(status: VoxideStatus): VoiceSessionPhase {
  switch (status) {
    case 'listening':
      return VoiceSessionPhase.LISTENING;
    case 'thinking':
    case 'executing':
    case 'connecting':
      return VoiceSessionPhase.PROCESSING;
    case 'speaking':
      return VoiceSessionPhase.SPEAKING;
    case 'error':
      return VoiceSessionPhase.ERROR;
    case 'idle':
    case 'armed':
    default:
      return VoiceSessionPhase.IDLE;
  }
}
