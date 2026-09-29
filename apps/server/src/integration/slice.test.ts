import { describe, expect, it } from 'vitest';
import {
  ActionStatus,
  ConsciousnessState,
  EmergencyType,
  IncidentSocketEvent,
  Language,
  VoiceSessionPhase,
} from '@voicesos/shared';
import { interpretTurn } from '../ai/orchestrate.js';
import { ScriptedLlmProvider } from '../ai/provider.js';
import { LlmIntent } from '../ai/schema.js';
import { emptyExtraction } from '../ai/validate.js';
import { initialIncident } from '../database/initialState.js';
import { generateHandoff } from '../handoff/generate.js';
import { publishedProtocols } from '../protocols/catalog.js';
import {
  clearPublishDedupe,
  createRecordingPublisher,
  publishCreated,
  publishUpdated,
  resetIncidentRealtime,
  setIncidentRealtime,
} from '../realtime/index.js';
import { classifyVoiceTurn } from '../voice/classify.js';
import { toVoiceTurnResponse } from '../voice/session.js';

const AT = '2026-09-29T17:00:00.000Z';

describe('backend vertical slice', () => {
  it('turns speech into protocol state, a handoff, and a live dashboard event', async () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);
    clearPublishDedupe();

    const heard = classifyVoiceTurn({
      transcript: 'My friend collapsed and he is not responding',
      recognitionConfidence: 0.94,
    });
    expect(heard.action).toBe('process');
    if (heard.action !== 'process') return;

    const opened = initialIncident({
      id: 'incident-slice',
      sessionId: 'session-slice',
      language: Language.ENGLISH,
      at: AT,
    });
    publishCreated(opened);

    const interpreted = await interpretTurn({
      incident: opened,
      transcript: heard.transcript,
      protocols: publishedProtocols,
      provider: new ScriptedLlmProvider([
        emptyExtraction({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.9,
          consciousness: ConsciousnessState.UNRESPONSIVE,
          questionAnswer: ConsciousnessState.UNRESPONSIVE,
          intent: LlmIntent.ANSWER,
          certainty: 'known',
        }),
      ]),
      at: AT,
    });
    publishUpdated(interpreted.incident);

    const spoken = toVoiceTurnResponse({
      incident: interpreted.incident,
      heard: heard.transcript,
      reply: interpreted.reply,
      source: interpreted.source,
      failure: null,
    });

    expect(spoken.reply).toBe('Call emergency services now. Put the phone on speaker if you can.');
    expect(spoken.source).toBe('protocol');
    expect(spoken.phase).toBe(VoiceSessionPhase.AWAITING_CONFIRMATION);
    expect(interpreted.incident.state.emergencyType).toBe(EmergencyType.UNCONSCIOUS);
    expect(interpreted.incident.state.patient.consciousness).toBe(ConsciousnessState.UNRESPONSIVE);
    expect(interpreted.incident.state.actions[0]?.status).toBe(ActionStatus.GIVEN);

    const handoff = generateHandoff({
      incident: interpreted.incident,
      timeline: [],
      protocol: publishedProtocols[0] ?? null,
      version: 1,
      at: AT,
    });

    expect(handoff.criticalInformation.some((fact) => fact.value === ConsciousnessState.UNRESPONSIVE)).toBe(true);
    expect(handoff.criticalInformation.some((fact) => fact.label === 'Breathing')).toBe(false);
    expect(handoff.uncertainty.some((note) => note.field === 'patient.breathing')).toBe(true);
    expect(calls.map((call) => call.event)).toEqual([
      IncidentSocketEvent.CREATED,
      IncidentSocketEvent.UPDATED,
    ]);

    resetIncidentRealtime();
    clearPublishDedupe();
  });
});
