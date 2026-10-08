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
 * A clear collapse, said in any of the three session languages.
 * The same shape as the server fast path, so the app can start that turn
 * the moment the words appear — before the agent decides to call a tool.
 */
const EARLY_EMERGENCY =
  /collapsed|unconscious|not responding|unresponsive|fainted|passed out|not breathing|isn't breathing|isnt breathing|no pulse|not waking|no response|won't wake|wont wake|ወድቋ|ወደቀ|አይመልስም|ምላሽ አይሰጥ|kufe|deebii hin kenn|hin deebine/iu;

/**
 * Tags sent to the live agent. Native audio wants the short code (`am`, `om`).
 * Region tags such as `am-ET` have made sessions go silent.
 */
export const VOXIDE_LANGUAGE: Record<Language, string> = {
  [Language.ENGLISH]: 'en-US',
  [Language.AMHARIC]: 'am',
  [Language.AFAAN_OROMO]: 'om',
};

const SPOKEN_NAME: Record<Language, string> = {
  [Language.ENGLISH]: 'English',
  [Language.AMHARIC]: 'Amharic',
  [Language.AFAAN_OROMO]: 'Afaan Oromo',
};

/** One sentence the agent must obey on every turn. The other two languages are named so it cannot drift. */
export function spokenLanguageRule(language: Language): string {
  const name = SPOKEN_NAME[language];
  const others = (Object.keys(SPOKEN_NAME) as Language[])
    .filter((item) => item !== language)
    .map((item) => SPOKEN_NAME[item])
    .join(' or ');
  return `The only spoken language is ${name}. Read sayExactly word for word in ${name}. Do not translate it. Never speak ${others}. If sayExactly is empty, stay completely silent.`;
}

/**
 * Host-only cue after connect. Never sent to the protocol LLM.
 * The agent speaks the greeting from `sayExactly` in the session language only.
 */
export const VOXIDE_OPENING_CUE = '__deres_open__';

export function isVoxideOpeningCue(utterance: unknown): boolean {
  return typeof utterance === 'string' && utterance.trim() === VOXIDE_OPENING_CUE;
}

/**
 * Voxide speaks Afaan Oromoo, which has no device voice. English and Amharic
 * are spoken by the host at once, so the greeting does not wait for the agent.
 */
export function appSpeaksLanguage(language: Language): boolean {
  return language === Language.ENGLISH || language === Language.AMHARIC;
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
  /** Resolves true when the host already said the greeting in this language. */
  greetingSpoken?: Promise<boolean> | null;
  /**
   * Resolves true when the phone itself can speak this language.
   * When it cannot, the agent must speak `sayExactly` — staying silent would
   * leave Amharic with no voice if the device has no Amharic pack.
   */
  hostSpeaks?: Promise<boolean>;
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
 * Voxide hears and speaks only the language chosen for this emergency.
 * Protocol text always comes from the server — never from the model.
 */
export function bindDeresSession(voxide: VoxideClient, binding: DeresVoiceBinding): () => void {
  const speechLanguage = VOXIDE_LANGUAGE[binding.language];
  const lines = voiceLoopCopy(binding.language);
  const languageRule = spokenLanguageRule(binding.language);
  let hostTalks = false;
  const hostDecided = (binding.hostSpeaks ?? Promise.resolve(false)).then((ok) => {
    hostTalks = ok;
    return ok;
  });
  let hostSpeaking = false;
  let lastHostLine = lines.greeting;
  let echoQuietUntil = 0;
  let claimedKey = '';
  let turnToken = 0;
  let flight: { key: string; promise: Promise<VoiceTurnResponse> } | null = null;

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

  const sameTurn = (previous: string, next: string) => {
    if (!previous || !next) return false;
    // "hello" must not swallow a later "hello, he collapsed".
    if (EARLY_EMERGENCY.test(next) && !EARLY_EMERGENCY.test(previous)) return false;
    if (previous === next || next.includes(previous) || previous.includes(next)) return true;
    return EARLY_EMERGENCY.test(previous) && EARLY_EMERGENCY.test(next);
  };

  const submit = (heard: string) => {
    const key = normalizeHeard(heard);
    if (flight && sameTurn(flight.key, key)) return flight.promise;
    const promise = incidentsApi.voiceTurn(
      binding.incidentId,
      { transcript: heard, language: binding.language },
      { skipRetry: true },
    );
    flight = { key, promise };
    return promise;
  };

  /**
   * One network turn per thing the person said. A live transcript can start
   * it before the agent calls the tool; the tool then reuses that result.
   */
  const take = async (heard: string, viaTool: boolean) => {
    voxide.setLanguage(speechLanguage);
    if (!heard || isVoxideOpeningCue(heard)) {
      if (!viaTool) return null;
      const said = binding.greetingSpoken ? await binding.greetingSpoken : false;
      if (said) return silence(speechLanguage);
      return { sayExactly: lines.greeting, language: speechLanguage };
    }

    const emergency = EARLY_EMERGENCY.test(heard);
    const echoed =
      isLikelyEcho(heard, lastHostLine) ||
      ((hostSpeaking || Date.now() < echoQuietUntil) && !emergency);
    if (echoed) return viaTool ? silence(speechLanguage) : null;

    const key = normalizeHeard(heard);
    const already = sameTurn(claimedKey, key);
    let token = turnToken;
    if (!already) {
      claimedKey = key;
      turnToken += 1;
      token = turnToken;
    }
    const turn = await submit(heard);
    const host = await hostDecided;
    const stale = already || token !== turnToken;
    const reply = stale && flight ? (await flight.promise).reply : turn.reply;
    if (stale && !viaTool) return null;
    if (!stale) binding.onTurn(turn);
    if (host) {
      if (!stale) speakOnHost(reply);
      return viaTool ? silence(speechLanguage) : null;
    }
    if (!viaTool) return null;
    return { sayExactly: reply, language: speechLanguage };
  };

  voxide.register({
    reportToDeres: {
      description: `Call this for every thing the person says, and when the app sends the opening cue __deres_open__. Pass the exact string. Do not speak your own sentence. When this returns, if sayExactly is empty stay completely silent and listen. If sayExactly has words, speak those words and nothing else. Never invent medical advice. ${languageRule}`,
      params: {
        utterance: {
          type: 'string',
          required: true,
          description: "The user's exact words, or the opening cue __deres_open__.",
        },
      },
      handler: async ({ utterance }: Record<string, unknown>) => {
        const heard = typeof utterance === 'string' ? utterance.trim() : '';
        return (await take(heard, true)) ?? silence(speechLanguage);
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
    spokenBy: hostTalks ? 'host_app' : 'voxide',
    rule: hostTalks
      ? `You are DERES. Never give medical advice of your own. Never speak aloud. Only call reportToDeres and then listen. The host app speaks every line. ${languageRule}`
      : `You are DERES. Never give medical advice of your own. Only speak text returned by reportToDeres as sayExactly. After the greeting, listen. ${languageRule}`,
  }));

  let seen = '';
  return voxide.subscribe(() => {
    const messages = voxide.getSnapshot().messages;
    let latest: { text: string; partial?: boolean } | undefined;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message?.role === 'user') {
        latest = message;
        break;
      }
    }
    if (!latest) return;
    const text = latest.text.trim();
    if (!text || text === seen || isVoxideOpeningCue(text)) return;
    // A half-heard sentence waits, unless it is already an obvious emergency.
    if (latest.partial && !EARLY_EMERGENCY.test(text)) return;
    seen = text;
    void take(text, false);
  });
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
