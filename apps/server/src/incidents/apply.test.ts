import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Certainty, ConsciousnessState, EventSource, Language } from '@voicesos/shared';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import { createIncident, listIncidentEvents } from '../database/persist.js';
import { applyIncidentCommand } from './apply.js';

describe('applyIncidentCommand', () => {
  let mongo: MongoMemoryServer;

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

  it('persists a changed answer without rewriting earlier timeline events', async () => {
    const { incident, createdEvent } = await createIncident({
      sessionId: 'session-apply',
      language: Language.ENGLISH,
    });

    await applyIncidentCommand(incident.id, {
      kind: 'record_answer',
      questionId: 'q-consciousness',
      question: 'Are they responding?',
      answer: 'No',
      certainty: Certainty.KNOWN,
      source: EventSource.USER,
      updatesField: 'patient.consciousness',
      updatesValue: ConsciousnessState.UNRESPONSIVE,
    });

    const afterChange = await applyIncidentCommand(incident.id, {
      kind: 'record_answer',
      questionId: 'q-consciousness',
      question: 'Are they responding?',
      answer: 'Yes',
      certainty: Certainty.KNOWN,
      source: EventSource.USER,
      updatesField: 'patient.consciousness',
      updatesValue: ConsciousnessState.RESPONSIVE,
    });

    const timeline = await listIncidentEvents(incident.id);
    expect(timeline[0]?.id).toBe(createdEvent.id);
    expect(timeline[0]?.type).toBe('incident_created');
    expect(timeline.map((event) => event.sequence)).toEqual(
      Array.from({ length: timeline.length }, (_, index) => index + 1),
    );
    expect(afterChange.incident.state.relevantAnswers.map((item) => item.answer)).toEqual(['No', 'Yes']);
    expect(afterChange.incident.state.patient.consciousness).toBe(ConsciousnessState.UNKNOWN);
  });
});
