import { Language } from '@voicesos/shared';
import { config } from '../common/config.js';
import { UpstreamUnavailableError } from '../common/errors.js';
import { logger } from '../common/logger.js';

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

export class HttpVoxideProvider implements VoxideProvider {
  constructor(
    private readonly options: {
      apiKey: string;
      baseUrl: string;
    },
  ) {}

  async transcribe(input: VoxideTranscribeInput): Promise<VoxideTranscribeResult> {
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/transcribe`;
    let response: Response;
    try {
      response = await fetch(url, {
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
      });
    } catch (error) {
      throw new UpstreamUnavailableError('Voxide', { cause: error });
    }

    if (!response.ok) {
      logger.warn('Voxide transcribe failed', { status: response.status });
      throw new UpstreamUnavailableError('Voxide');
    }

    const body = (await response.json()) as {
      transcript?: string;
      confidence?: number | null;
      language?: Language;
    };
    return {
      transcript: body.transcript ?? '',
      confidence: body.confidence ?? null,
      language: body.language ?? input.language,
    };
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
