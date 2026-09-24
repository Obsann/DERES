import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { ActionStatus, EventSource, Language } from '@voicesos/shared';
import { createApp } from '../app.js';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import { applyIncidentCommand } from './apply.js';

describe('incident API', () => {
  let mongo: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDatabase(mongo.getUri());
  }, 300_000);

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongo) await mongo.stop();
  });

  it('creates, reads, updates and reconstructs an incident from the timeline', async () => {
    const created = await request(app).post('/api/incidents').send({
      language: Language.ENGLISH,
      initialTranscript: 'My friend collapsed',
    });

    expect(created.status).toBe(201);
    expect(created.body.ok).toBe(true);
    const id = created.body.data.id as string;
    expect(created.body.data.language).toBe('en');
    expect(created.body.data.status).toBe('active');

    const read = await request(app).get(`/api/incidents/${id}`);
    expect(read.status).toBe(200);
    expect(read.body.data.id).toBe(id);
    expect(read.body.data.sessionId).toBeTruthy();

    const patched = await request(app).patch(`/api/incidents/${id}`).send({
      location: { description: 'Bole, near Edna Mall' },
    });
    expect(patched.status).toBe(200);
    expect(patched.body.data.state.location.description).toBe('Bole, near Edna Mall');

    const message = await request(app).post(`/api/incidents/${id}/messages`).send({
      role: 'user',
      language: 'en',
      transcript: 'He is not responding',
    });
    expect(message.status).toBe(201);
    expect(message.body.data.incidentId).toBe(id);
    expect(message.body.data.transcript).toBe('He is not responding');

    await applyIncidentCommand(id, {
      kind: 'give_action',
      id: 'action-call',
      protocolId: 'protocol-unconscious-adult',
      stepId: 'step-call-ems',
      instruction: 'Call emergency services now. Put the phone on speaker if you can.',
      source: EventSource.PROTOCOL,
    });

    const action = await request(app).post(`/api/incidents/${id}/actions`).send({
      actionId: 'action-call',
      status: ActionStatus.CONFIRMED,
    });
    expect(action.status).toBe(200);
    expect(action.body.data.status).toBe('confirmed');

    const timeline = await request(app).get(`/api/incidents/${id}/timeline`);
    expect(timeline.status).toBe(200);
    const sequences = timeline.body.data.map((event: { sequence: number }) => event.sequence);
    expect(sequences).toEqual(Array.from({ length: sequences.length }, (_, index) => index + 1));
    expect(timeline.body.data[0].type).toBe('incident_created');
    expect(timeline.body.data.some((event: { type: string }) => event.type === 'message_added')).toBe(true);
    expect(timeline.body.data.some((event: { type: string }) => event.type === 'action_confirmed')).toBe(true);

    const after = await request(app).get(`/api/incidents/${id}`);
    expect(after.body.data.state.location.description).toBe('Bole, near Edna Mall');
    expect(after.body.data.state.actions[0].status).toBe('confirmed');
  });

  it('returns 404 for an unknown incident and 400 for a bad create body', async () => {
    const missing = await request(app).get('/api/incidents/does-not-exist');
    expect(missing.status).toBe(404);
    expect(missing.body.ok).toBe(false);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    const bad = await request(app).post('/api/incidents').send({ language: 'xx' });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('VALIDATION_ERROR');
  });
});
