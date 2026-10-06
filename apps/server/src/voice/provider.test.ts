import { describe, expect, it } from 'vitest';
import { Language } from '@voicesos/shared';
import { UpstreamUnavailableError } from '../common/errors.js';
import { HttpVoxideProvider } from './provider.js';

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function providerWith(responses: Response[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (!next) throw new Error('no more responses');
    return next;
  }) as unknown as typeof fetch;
  return { calls, provider: new HttpVoxideProvider({ apiKey: 'test-key', baseUrl: 'https://voxide.test/v1/', fetchImpl }) };
}

const clip = { audioBase64: 'UklGRg==', language: Language.AMHARIC, mimeType: 'audio/wav' };

describe('HttpVoxideProvider', () => {
  it('sends the clip and language and returns the transcript', async () => {
    const { calls, provider } = providerWith([json({ transcript: 'ጓደኛዬ ወደቀ', confidence: 0.9 })]);

    const result = await provider.transcribe(clip);

    expect(result).toEqual({ transcript: 'ጓደኛዬ ወደቀ', confidence: 0.9, language: 'am' });
    expect(calls[0]?.url).toBe('https://voxide.test/v1/transcribe');
    expect(JSON.parse(calls[0]?.init.body as string)).toEqual({
      audioBase64: clip.audioBase64,
      language: 'am',
      mimeType: 'audio/wav',
    });
  });

  it('does not call Voxide for an empty clip', async () => {
    const { calls, provider } = providerWith([]);
    const result = await provider.transcribe({ ...clip, audioBase64: '' });
    expect(result.transcript).toBe('');
    expect(calls).toHaveLength(0);
  });

  it('retries a transient failure', async () => {
    const { calls, provider } = providerWith([json({}, 503), json({ transcript: 'help' })]);
    const result = await provider.transcribe(clip);
    expect(result.transcript).toBe('help');
    expect(calls).toHaveLength(2);
  });

  it('fails fast when a rate limit outlasts a spoken turn', async () => {
    const { calls, provider } = providerWith([json({}, 429, { 'Retry-After': '60' })]);
    await expect(provider.transcribe(clip)).rejects.toBeInstanceOf(UpstreamUnavailableError);
    expect(calls).toHaveLength(1);
  });

  it('does not retry a request Voxide rejected as malformed', async () => {
    const { calls, provider } = providerWith([json({ error: 'bad' }, 400)]);
    await expect(provider.transcribe(clip)).rejects.toBeInstanceOf(UpstreamUnavailableError);
    expect(calls).toHaveLength(1);
  });

  it('reports a body that times out mid-read as Voxide being down', async () => {
    const stalled = new Response(
      new ReadableStream({
        start(controller) {
          controller.error(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
        },
      }),
      { status: 200 },
    );
    const { provider } = providerWith([stalled]);
    await expect(provider.transcribe(clip)).rejects.toBeInstanceOf(UpstreamUnavailableError);
  });
});
