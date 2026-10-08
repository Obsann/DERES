import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { Language } from '@voicesos/shared';
import { createApp } from '../app.js';
import { ScriptedVoxideProvider, type VoxideProvider } from './provider.js';
import { MAX_SPOKEN_CHARACTERS } from './speech.routes.js';

function countingProvider() {
  const spoken: { text: string; language: Language }[] = [];
  const provider: VoxideProvider = {
    transcribe: async (input) => ({ transcript: '', confidence: null, language: input.language }),
    synthesize: async (text, language) => {
      spoken.push({ text, language });
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { audioBase64: Buffer.from(`clip:${text}`).toString('base64'), contentType: 'audio/mpeg' };
    },
  };
  return { spoken, provider };
}

describe('speech API', () => {
  it('reports what the server can do', async () => {
    const off = await request(createApp()).get('/api/speech/status');
    expect(off.body.data).toEqual({ transcribe: false, synthesize: false });

    const transcribeOnly = new ScriptedVoxideProvider({ transcript: '', confidence: null, language: Language.ENGLISH });
    const voxide = await request(createApp({ voxideProvider: transcribeOnly })).get('/api/speech/status');
    expect(voxide.body.data).toEqual({ transcribe: true, synthesize: false });
  });

  it('returns audio and generates a repeated line only once', async () => {
    const { spoken, provider } = countingProvider();
    const app = createApp({ voxideProvider: provider });
    const body = { text: 'እያሰብኩ ነው።', language: Language.AMHARIC };

    const [first, concurrent] = await Promise.all([
      request(app).post('/api/speech/synthesize').send(body),
      request(app).post('/api/speech/synthesize').send(body),
    ]);
    const later = await request(app).post('/api/speech/synthesize').send(body);

    for (const response of [first, concurrent, later]) {
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('audio/mpeg');
      expect(Buffer.from(response.body as Buffer).toString()).toBe('clip:እያሰብኩ ነው።');
    }
    expect(spoken).toHaveLength(1);
  });

  it('caches per language', async () => {
    const { spoken, provider } = countingProvider();
    const app = createApp({ voxideProvider: provider });
    await request(app).post('/api/speech/synthesize').send({ text: 'DERES', language: Language.AMHARIC });
    await request(app).post('/api/speech/synthesize').send({ text: 'DERES', language: Language.AFAAN_OROMO });
    expect(spoken.map((item) => item.language)).toEqual(['am', 'om']);
  });

  it('rejects unsupported languages and oversized text', async () => {
    const app = createApp({ voxideProvider: countingProvider().provider });
    const badLanguage = await request(app).post('/api/speech/synthesize').send({ text: 'hi', language: 'fr' });
    expect(badLanguage.status).toBe(400);

    const tooLong = await request(app)
      .post('/api/speech/synthesize')
      .send({ text: 'a'.repeat(MAX_SPOKEN_CHARACTERS + 1), language: Language.ENGLISH });
    expect(tooLong.status).toBe(400);
  });

  it('speaks through an injected synthesizer when the voice provider has none', async () => {
    const app = createApp({
      synthesizer: async (text) => ({
        audioBase64: Buffer.from(`clip:${text}`).toString('base64'),
        contentType: 'audio/mpeg',
      }),
    });
    const status = await request(app).get('/api/speech/status');
    expect(status.body.data).toEqual({ transcribe: false, synthesize: true });
    const audio = await request(app).post('/api/speech/synthesize').send({ text: 'ሰላም', language: Language.AMHARIC });
    expect(audio.status).toBe(200);
    expect(audio.headers['content-type']).toContain('audio/mpeg');
  });

  it('is unavailable without a voice, so the browser falls back to its own', async () => {
    const response = await request(createApp()).post('/api/speech/synthesize').send({ text: 'hi', language: 'en' });
    expect(response.status).toBe(503);
  });

  it('accepts a voice turn larger than the default JSON cap', async () => {
    const audioBase64 = 'A'.repeat(600 * 1024);
    const response = await request(createApp())
      .post('/api/incidents/missing/voice')
      .send({ audioBase64, mimeType: 'audio/wav' });
    expect(response.status).not.toBe(413);
  });
});
