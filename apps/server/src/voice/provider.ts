import { Language } from '@voicesos/shared';
import { config } from '../common/config.js';
import { UpstreamUnavailableError } from '../common/errors.js';
import { logger } from '../common/logger.js';
import { observeProviderCall } from '../common/observe.js';
import { fetchWithRetry, readJson } from '../common/upstream.js';

export interface VoxideTranscribeInput {
  audioBase64: string;
  language: Language;
  mimeType?: string;
}

export interface VoxideTranscribeResult {
  transcript: string;
  confidence: number | null;
  language: Language;
}

export interface VoxideSynthesizeResult {
  audioBase64: string;
  contentType: string;
}

/**
 * Speech in/out. Voxide is the client-side voice layer; this port is how
 * the server talks to a Voxide (or compatible) speech endpoint when the
 * browser sends audio instead of a transcript.
 */
export interface VoxideProvider {
  transcribe(input: VoxideTranscribeInput): Promise<VoxideTranscribeResult>;
  synthesize?(text: string, language: Language): Promise<VoxideSynthesizeResult>;
}

/** A ~10s clip; past this the person hears the "say that again" line instead of silence. */
const TRANSCRIBE_TIMEOUT_MS = 20_000;

export class HttpVoxideProvider implements VoxideProvider {
  constructor(
    private readonly options: {
      apiKey: string;
      baseUrl: string;
      fetchImpl?: typeof fetch;
    },
  ) {}

  async transcribe(input: VoxideTranscribeInput): Promise<VoxideTranscribeResult> {
    if (input.audioBase64 === '') {
      return { transcript: '', confidence: null, language: input.language };
    }

    const startedAt = Date.now();
    try {
      const response = await fetchWithRetry({
        dependency: 'Voxide',
        url: `${this.options.baseUrl.replace(/\/$/, '')}/transcribe`,
        init: {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.options.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioBase64: input.audioBase64,
            language: input.language,
            mimeType: input.mimeType ?? 'audio/webm',
          }),
        },
        timeoutMs: TRANSCRIBE_TIMEOUT_MS,
        fetchImpl: this.options.fetchImpl,
      });

      if (!response.ok) {
        logger.warn('Voxide transcribe failed', { status: response.status });
        throw new UpstreamUnavailableError('Voxide');
      }

      const body = await readJson<{
        transcript?: string;
        confidence?: number | null;
        language?: Language;
      }>(response, 'Voxide');
      observeProviderCall({ provider: 'voxide', operation: 'transcribe', startedAt, ok: true, status: response.status });
      return {
        transcript: body.transcript ?? '',
        confidence: body.confidence ?? null,
        language: body.language ?? input.language,
      };
    } catch (error) {
      observeProviderCall({
        provider: 'voxide',
        operation: 'transcribe',
        startedAt,
        ok: false,
        failure: error instanceof Error ? error.name : 'error',
      });
      throw error;
    }
  }
}

export function createVoxideProvider(): VoxideProvider | null {
  if (config.voxideApiKey === null) return null;
  return new HttpVoxideProvider({
    apiKey: config.voxideApiKey,
    baseUrl: config.voxideBaseUrl,
  });
}

export class ScriptedVoxideProvider implements VoxideProvider {
  constructor(private readonly result: VoxideTranscribeResult) {}

  async transcribe(): Promise<VoxideTranscribeResult> {
    return this.result;
  }
}
