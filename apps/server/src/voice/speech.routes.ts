import { ApiErrorCode, Language } from '@voicesos/shared';
import { Router } from 'express';
import { AppError, UpstreamUnavailableError, ValidationError } from '../common/errors.js';
import { sendSuccess } from '../common/http.js';
import { isSupportedVoiceLanguage } from './classify.js';
import type { VoxideProvider, VoxideSynthesizeResult } from './provider.js';
import { prepareSpokenLine } from './spoken.js';

/** Protocol lines are a sentence or two. A cap keeps this from being a free TTS service. */
export const MAX_SPOKEN_CHARACTERS = 600;

/**
 * Replies are fixed protocol text, so the same few dozen lines repeat across
 * every incident. Caching them makes repeats instant and free.
 */
const MAX_CACHED_CLIPS = 300;

/** Uncached generations per client per minute. Cache hits are not counted. */
const GENERATIONS_PER_MINUTE = 30;

interface Clip {
  bytes: Buffer;
  contentType: string;
}

export interface SpeechRouterOptions {
  speechProvider?: VoxideProvider | null;
  /**
   * Speaks a line when the voice provider has no synthesizer.
   * Amharic and Afaan Oromoo use this; English stays on the device voice.
   */
  synthesizer?: (text: string, language: Language) => Promise<VoxideSynthesizeResult>;
  now?: () => number;
}

export function createSpeechRouter(options: SpeechRouterOptions = {}): Router {
  const router = Router();
  const provider = options.speechProvider ?? null;
  const now = options.now ?? Date.now;
  const synthesize =
    typeof provider?.synthesize === 'function'
      ? provider.synthesize.bind(provider)
      : (options.synthesizer ?? null);
  const clips = new Map<string, Clip>();
  const inFlight = new Map<string, Promise<Clip>>();
  const budget = new Map<string, { windowStart: number; used: number }>();

  function spend(client: string): void {
    const at = now();
    const entry = budget.get(client);
    if (!entry || at - entry.windowStart >= 60_000) {
      if (budget.size > 10_000) budget.clear();
      budget.set(client, { windowStart: at, used: 1 });
      return;
    }
    if (entry.used >= GENERATIONS_PER_MINUTE) {
      throw new AppError(ApiErrorCode.RATE_LIMITED, 429, 'Too many speech requests');
    }
    entry.used += 1;
  }

  function remember(key: string, clip: Clip): void {
    clips.delete(key);
    clips.set(key, clip);
    if (clips.size > MAX_CACHED_CLIPS) {
      const oldest = clips.keys().next().value;
      if (oldest !== undefined) clips.delete(oldest);
    }
  }

  async function clipFor(text: string, language: Language, client: string): Promise<Clip> {
    const key = `${language}\u0000${text}`;
    const cached = clips.get(key);
    if (cached) {
      remember(key, cached);
      return cached;
    }
    // A prefetch and a live request for the same line share one generation.
    const pending = inFlight.get(key);
    if (pending) return pending;

    if (!synthesize) throw new UpstreamUnavailableError('Speech synthesis');
    spend(client);

    const work = synthesize(text, language)
      .then((result) => {
        const clip = { bytes: Buffer.from(result.audioBase64, 'base64'), contentType: result.contentType };
        remember(key, clip);
        return clip;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, work);
    return work;
  }

  /** Lets the client pick an engine without guessing from a failed turn. */
  router.get('/speech/status', (_req, res) => {
    sendSuccess(res, {
      transcribe: provider !== null,
      synthesize: synthesize !== null,
    });
  });

  /** `POST /api/speech/synthesize` `{ text, language }` → audio bytes. 503 until the provider can synthesize. */
  router.post('/speech/synthesize', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const language = body['language'];
    const text = typeof body['text'] === 'string' ? prepareSpokenLine(body['text']) : '';

    if (typeof language !== 'string' || !isSupportedVoiceLanguage(language)) {
      throw new ValidationError('language must be a supported voice language', [
        { path: 'language', message: `must be one of ${Object.values(Language).join(', ')}` },
      ]);
    }
    if (text === '' || text.length > MAX_SPOKEN_CHARACTERS) {
      throw new ValidationError('text is required', [
        { path: 'text', message: `must be 1 to ${MAX_SPOKEN_CHARACTERS} characters` },
      ]);
    }

    const clip = await clipFor(text, language, req.ip ?? 'unknown');
    res
      .status(200)
      .set('Content-Type', clip.contentType)
      .set('Cache-Control', 'private, max-age=86400')
      .send(clip.bytes);
  });

  return router;
}
