import { Language, isApiSuccess, type ApiResponse } from '@voicesos/shared';
import { getApiBaseUrl } from '@/services/api/config';
import { voiceLoopCopy } from '@/services/voice/loopCopy';
import { hasLocalVoice, speakLocally } from '@/services/voice/speakLocally';

/**
 * Speech out for the lines the app says itself.
 *
 * A line is spoken only in the language it was requested in. English uses an
 * English voice, Amharic an Amharic voice. Afaan Oromoo is not spoken here —
 * there is no Afaan Oromoo voice to substitute, and the Amharic voice must
 * not read it.
 *
 * Server clips are kept in memory and, where the browser allows, in Cache
 * Storage, so the fixed lines still play with no connection.
 */

export interface SpeechStatus {
  transcribe: boolean;
  synthesize: boolean;
}

const BCP47: Record<Language, string> = {
  [Language.ENGLISH]: 'en-US',
  [Language.AMHARIC]: 'am-ET',
  [Language.AFAAN_OROMO]: 'om-ET',
};

const CACHE_NAME = 'deres-speech-v1';
const SYNTHESIZE_TIMEOUT_MS = 20_000;

let status: Promise<SpeechStatus> | undefined;
const clips = new Map<string, Promise<Blob | null>>();
let current: { audio: HTMLAudioElement; finish: (ok: boolean) => void } | null = null;

/** Asked once per page load. A failure reads as "no server speech". */
export function getSpeechStatus(): Promise<SpeechStatus> {
  status ??= fetch(`${getApiBaseUrl()}/api/speech/status`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(4000),
  })
    .then(async (response) => {
      const body = (await response.json()) as ApiResponse<SpeechStatus>;
      return isApiSuccess(body) ? body.data : { transcribe: false, synthesize: false };
    })
    .catch(() => {
      status = undefined;
      return { transcribe: false, synthesize: false };
    });
  return status;
}

function cacheKey(text: string, language: Language): string {
  return `${location.origin}/__deres-speech/${language}?t=${encodeURIComponent(text)}`;
}

/** Cache Storage only exists in secure contexts, so a LAN-IP dev build runs without it. */
function speechCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return Promise.resolve(null);
  return caches.open(CACHE_NAME).catch(() => null);
}

async function fetchClip(text: string, language: Language): Promise<Blob | null> {
  const cache = await speechCache();
  const key = cacheKey(text, language);
  const stored = await cache?.match(key).catch(() => undefined);
  if (stored) return stored.blob();

  if (!(await getSpeechStatus()).synthesize) return null;
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
      signal: AbortSignal.timeout(SYNTHESIZE_TIMEOUT_MS),
    });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) return null;
    const blob = await response.blob();
    void cache?.put(key, new Response(blob, { headers: { 'Content-Type': blob.type } })).catch(() => undefined);
    return blob;
  } catch {
    return null;
  }
}

function clipFor(text: string, language: Language): Promise<Blob | null> {
  const key = `${language}\u0000${text}`;
  let clip = clips.get(key);
  if (!clip) {
    clip = fetchClip(text, language).then((blob) => {
      // A miss is not remembered, so the next attempt can reach the server.
      if (!blob) clips.delete(key);
      return blob;
    });
    clips.set(key, clip);
  }
  return clip;
}

function playBlob(blob: Blob): Promise<boolean> {
  stopSpeaking();
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const finish = (ok: boolean) => {
      if (current?.audio !== audio) return;
      current = null;
      audio.onended = null;
      audio.onerror = null;
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    current = { audio, finish };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    // Autoplay refusal is a failure to speak, not an exception.
    audio.play().catch(() => finish(false));
  });
}

/** Stops whatever is playing. A stopped line resolves `speak` with true. */
export function stopSpeaking(): void {
  if (current) {
    const { audio, finish } = current;
    audio.pause();
    finish(true);
  }
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

/**
 * True when this language can be spoken here: a matching device voice, or
 * the server clip. Afaan Oromoo is never claimed — nothing may substitute.
 */
export async function canSpeak(language: Language): Promise<boolean> {
  if (language === Language.AFAAN_OROMO) return false;
  if (await hasLocalVoice(BCP47[language])) return true;
  return (await getSpeechStatus()).synthesize;
}

/**
 * Speaks one line. Returns false only when no voice could say it, so the
 * caller shows the text instead of apologising through a dead channel.
 */
export async function speak(text: string, language: Language): Promise<boolean> {
  const line = text.trim();
  if (line === '') return false;

  const locale = BCP47[language];
  // The device voice and the server clip start together. Whichever can speak
  // in this language goes first; the other is not allowed to fill in.
  const clipPromise = clipFor(line, language);
  if (await speakLocally(line, locale)) return true;

  const clip = await clipPromise;
  if (clip && (await playBlob(clip))) return true;

  return false;
}

/**
 * Warms the lines spoken around every turn. One at a time on purpose: speech
 * providers rate-limit a burst, and a parallel prefetch loses the tail.
 */
export async function prefetchSpokenLines(language: Language, extra: readonly string[] = []): Promise<void> {
  // Afaan Oromoo has no server voice. Do not prefetch it — a miss must not
  // be filled with the Amharic clip.
  if (language === Language.AFAAN_OROMO || !(await getSpeechStatus()).synthesize) return;
  const lines = voiceLoopCopy(language);
  for (const line of [lines.greeting, lines.permission, lines.thinking, lines.micDenied, lines.hearingYou, ...extra]) {
    await clipFor(line, language);
  }
}
