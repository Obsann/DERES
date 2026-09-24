import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRole } from '@voicesos/shared';
import { createApp } from '../app.js';
import { redact } from '../common/logger.js';
import { issueResponderToken } from './tokens.js';

describe('security middleware', () => {
  const app = createApp();

  it('rejects responder routes without a bearer token', async () => {
    const list = await request(app).get('/api/responder/incidents');
    expect(list.status).toBe(401);
    expect(list.body.ok).toBe(false);
    expect(list.body.error.code).toBe('UNAUTHORIZED');
    expect(JSON.stringify(list.body)).not.toContain('dev-only-session-secret');
    expect(JSON.stringify(list.body)).not.toMatch(/invite/i);

    const handoff = await request(app).get('/api/incidents/any-id/handoff');
    expect(handoff.status).toBe(401);
  });

  it('rejects a forged bearer token and leaves the anonymous emergency flow open', async () => {
    const forged = await request(app)
      .get('/api/responder/incidents')
      .set('Authorization', 'Bearer totally-forged.token');
    expect(forged.status).toBe(401);

    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body.ok).toBe(true);
  });

  it('does not treat a signed token as enough without the user existing', async () => {
    const token = issueResponderToken('missing-user', UserRole.RESPONDER);
    const response = await request(app).get('/api/responder/incidents').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(response.body)).not.toContain('dev-only-session-secret');
  });

  it('redacts secrets and emergency content from logs', () => {
    const redacted = redact({
      llmApiKey: 'sk-live-secret',
      voxideApiKey: 'vox-secret',
      token: 'bearer-secret',
      transcript: 'He is not breathing',
      location: 'Bole',
    }) as Record<string, unknown>;
    expect(redacted.llmApiKey).toBe('[redacted]');
    expect(redacted.voxideApiKey).toBe('[redacted]');
    expect(redacted.token).toBe('[redacted]');
    expect(redacted.transcript).toBe('[redacted]');
    expect(redacted.location).toBe('[redacted]');
  });
});
