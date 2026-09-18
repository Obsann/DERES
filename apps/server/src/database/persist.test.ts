import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import {
  EventSource,
  IncidentEventType,
  Language,
  MessageRole,
} from '@voicesos/shared';
import { createApp } from '../app.js';
import { connectDatabase, disconnectDatabase } from './connection.js';
import {
  appendIncidentEvent,
  createIncident,
  getIncidentById,
  insertConversationMessage,
  insertSession,
  listIncidentEvents,
} from './persist.js';
import { createId, nowIso } from './ids.js';
import { NotFoundError } from '../common/errors.js';

describe('database schema v1', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDatabase(mongo.getUri());
  }, 120_000);

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongo.stop();
  });

  it('persists an incident and retrieves it by id', async () => {
    const session = await insertSession({
      id: createId(),
      userId: null,
      language: Language.ENGLISH,
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    });

    const { incident, createdEvent } = await createIncident({
      sessionId: session.id,
      language: Language.ENGLISH,
    });

    const loaded = await getIncidentById(incident.id);
    expect(loaded.id).toBe(incident.id);
    expect(loaded.sessionId).toBe(session.id);
    expect(loaded.userId).toBeNull();
    expect(loaded.state.emergencyType).toBe('unknown');
    expect(createdEvent.sequence).toBe(1);
    expect(createdEvent.incidentId).toBe(incident.id);
  });

  it('returns events in sequence order so the timeline can be replayed', async () => {
    const { incident } = await createIncident({
      sessionId: createId(),
      language: Language.AMHARIC,
    });

    const second = await appendIncidentEvent(incident.id, {
      type: IncidentEventType.ANSWER_RECORDED,
      source: EventSource.USER,
      summary: 'User said the person is unresponsive',
      payload: { consciousness: 'unresponsive' },
      occurredAt: '2026-09-18T16:00:02.000Z',
    });
    const third = await appendIncidentEvent(incident.id, {
      type: IncidentEventType.STATE_CHANGED,
      source: EventSource.SYSTEM,
      summary: 'Consciousness updated',
      payload: { field: 'patient.consciousness' },
      occurredAt: '2026-09-18T16:00:01.000Z',
    });

    const timeline = await listIncidentEvents(incident.id);
    expect(timeline.map((event) => event.sequence)).toEqual([1, 2, 3]);
    expect(timeline[1]?.id).toBe(second.id);
    expect(timeline[2]?.id).toBe(third.id);
    expect(timeline[2]?.occurredAt).toBe('2026-09-18T16:00:01.000Z');
  });

  it('rejects an event for an incident that does not exist', async () => {
    await expect(
      appendIncidentEvent(createId(), {
        type: IncidentEventType.MESSAGE_ADDED,
        source: EventSource.USER,
        summary: 'orphan',
        payload: null,
        occurredAt: nowIso(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('keeps conversation messages traceable to their incident', async () => {
    const { incident } = await createIncident({
      sessionId: createId(),
      language: Language.ENGLISH,
    });

    const message = await insertConversationMessage({
      incidentId: incident.id,
      role: MessageRole.USER,
      transcript: 'My friend collapsed',
      language: Language.ENGLISH,
      recognitionConfidence: 0.9,
    });

    expect(message.incidentId).toBe(incident.id);
  });

  it('reports database as up on the health endpoint once connected', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.dependencies.database).toBe('up');
  });
});
