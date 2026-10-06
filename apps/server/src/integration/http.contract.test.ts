import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { Language } from '@voicesos/shared';
import { createApp } from '../app.js';
import { config } from '../common/config.js';
import { unconsciousAdultProtocol } from '../protocols/catalog.js';

describe('contract-aligned HTTP surface', () => {
  const app = createApp();

  it('lists published protocols without a database', async () => {
    const list = await request(app).get('/api/protocols');
    expect(list.status).toBe(200);
    expect(list.body.ok).toBe(true);
    expect(list.body.data.some((item: { id: string }) => item.id === unconsciousAdultProtocol.id)).toBe(true);

    const one = await request(app).get(`/api/protocols/${unconsciousAdultProtocol.id}`);
    expect(one.status).toBe(200);
    expect(one.body.data.id).toBe(unconsciousAdultProtocol.id);

    const missing = await request(app).get('/api/protocols/not-a-protocol');
    expect(missing.status).toBe(404);
  });

  it('reports llm and voice in health without calling those providers', async () => {
    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body.data.dependencies.llm).toBe(config.llmApiKey === null ? 'unknown' : 'up');
    expect(health.body.data.dependencies.voice).toBe(config.voxideApiKey === null ? 'unknown' : 'up');
  });

  it('rejects an unauthenticated incident list and a voice turn without an LLM', async () => {
    const list = await request(app).get('/api/incidents');
    expect(list.status).toBe(401);

    const voice = await request(app).post('/api/incidents/any-id/voice').send({
      language: Language.ENGLISH,
      transcript: 'He collapsed',
    });
    expect(voice.status).toBe(503);
    expect(voice.body.error.code).toBe('UPSTREAM_UNAVAILABLE');
  });
});
