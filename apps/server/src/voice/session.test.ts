import { describe, expect, it } from 'vitest';
import {
  ConsciousnessState,
  EmergencyType,
  Language,
} from '@voicesos/shared';
import { interpretTurn } from '../ai/orchestrate.js';
import { ScriptedLlmProvider } from '../ai/provider.js';
import { LlmIntent } from '../ai/schema.js';
import { emptyExtraction } from '../ai/validate.js';
import { initialIncident } from '../database/initialState.js';
import { publishedProtocols } from '../protocols/catalog.js';
import { classifyVoiceTurn } from './classify.js';

const AT = '2026-09-24T18:00:00.000Z';

describe('voice conversation flow', () => {
  it('turns spoken language into a protocol-controlled reply', async () => {
    const heard = classifyVoiceTurn({
      transcript: 'My friend collapsed and he is not responding',
      recognitionConfidence: 0.93,
    });
    expect(heard.action).toBe('process');
    if (heard.action !== 'process') return;

    const result = await interpretTurn({
      incident: initialIncident({
        id: 'incident-voice',
        sessionId: 'session-voice',
        language: Language.ENGLISH,
        at: AT,
      }),
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

    expect(result.reply).toBe('Call emergency services now. Put the phone on speaker if you can.');
    expect(result.source).toBe('protocol');
    expect(result.incident.state.patient.consciousness).toBe(ConsciousnessState.UNRESPONSIVE);
  });
});
