import { describe, expect, it } from 'vitest';
import { unconsciousAdultProtocol } from '@voicesos/protocols';
import {
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EventSource,
  Language,
} from '@voicesos/shared';
import { AiValidationError } from '../common/errors.js';
import { initialIncident } from '../database/initialState.js';
import { applyCommand } from '../incidents/stateEngine.js';
import { startProtocol } from '../protocols/execute.js';
import { interpretTurn } from './orchestrate.js';
import { runSafetyPipeline } from './pipeline.js';
import { ScriptedLlmProvider } from './provider.js';
import { LlmIntent } from './schema.js';
import { emptyExtraction } from './validate.js';

const AT = '2026-09-24T17:30:00.000Z';

function openIncident() {
  return initialIncident({
    id: 'incident-safety',
    sessionId: 'session-safety',
    language: Language.ENGLISH,
    at: AT,
  });
}

function readyOnQuestion() {
  const typed = applyCommand(
    openIncident(),
    {
      kind: 'set_emergency_type',
      emergencyType: EmergencyType.UNCONSCIOUS,
      confidence: 0.9,
      source: EventSource.AI,
    },
    AT,
  ).incident;
  return startProtocol(typed, unconsciousAdultProtocol, AT).incident;
}

describe('AI safety pipeline', () => {
  it('blocks a guessed protocol answer that is not an accepted value', () => {
    const incident = readyOnQuestion();
    expect(() =>
      runSafetyPipeline(
        JSON.stringify(
          emptyExtraction({
            emergencyTypeConfidence: 0,
            certainty: Certainty.KNOWN,
            intent: LlmIntent.ANSWER,
            questionAnswer: 'Give two aspirin',
          }),
        ),
        { incident, protocol: unconsciousAdultProtocol },
      ),
    ).toThrow(AiValidationError);
  });

  it('blocks invented guidance hidden in observations before any reply is built', () => {
    const incident = readyOnQuestion();
    expect(() =>
      runSafetyPipeline(
        JSON.stringify(
          emptyExtraction({
            emergencyTypeConfidence: 0,
            certainty: Certainty.KNOWN,
            intent: LlmIntent.ANSWER,
            questionAnswer: ConsciousnessState.UNRESPONSIVE,
            observations: ['you should start surgery immediately'],
          }),
        ),
        { incident, protocol: unconsciousAdultProtocol },
      ),
    ).toThrow(/invented medical guidance/);
  });

  it('blocks collapsing uncertainty into a known answer', () => {
    const incident = readyOnQuestion();
    expect(() =>
      runSafetyPipeline(
        JSON.stringify(
          emptyExtraction({
            emergencyTypeConfidence: 0,
            certainty: Certainty.KNOWN,
            intent: LlmIntent.ANSWER,
            questionAnswer: 'unknown',
          }),
        ),
        { incident, protocol: unconsciousAdultProtocol },
      ),
    ).toThrow(/Uncertainty/);
  });

  it('does not speak an unsafe model payload to the user', async () => {
    const incident = openIncident();
    await expect(
      interpretTurn({
        incident,
        transcript: 'What medicine should I give him?',
        protocols: [unconsciousAdultProtocol],
        provider: new ScriptedLlmProvider([
          JSON.stringify({
            ...emptyExtraction({
              emergencyType: EmergencyType.UNCONSCIOUS,
              emergencyTypeConfidence: 0.7,
              certainty: Certainty.KNOWN,
              intent: LlmIntent.ANSWER,
            }),
            instruction: 'Give him nitroglycerin',
          }),
        ]),
        at: AT,
      }),
    ).rejects.toBeInstanceOf(AiValidationError);

    expect(incident.state.actions).toHaveLength(0);
    expect(incident.state.currentProtocolId).toBeNull();
  });
});
