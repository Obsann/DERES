import { describe, expect, it } from 'vitest';
import { unconsciousAdultProtocol } from '@voicesos/protocols';
import {
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  Language,
} from '@voicesos/shared';
import { AiValidationError } from '../common/errors.js';
import { initialIncident } from '../database/initialState.js';
import { interpretTurn } from './orchestrate.js';
import { SAFE_PHRASES, safePhrases } from './phrases.js';
import { ScriptedLlmProvider } from './provider.js';
import { LlmIntent } from './schema.js';
import { emptyExtraction } from './validate.js';

const AT = '2026-09-24T17:00:00.000Z';

function openIncident() {
  return initialIncident({
    id: 'incident-llm',
    sessionId: 'session-llm',
    language: Language.ENGLISH,
    at: AT,
  });
}

function extract(overrides: Parameters<typeof emptyExtraction>[0]) {
  return emptyExtraction({
    certainty: Certainty.KNOWN,
    intent: LlmIntent.REQUEST_HELP,
    ...overrides,
  });
}

describe('LLM orchestration', () => {
  it('turns a natural statement into structured state and a protocol instruction', async () => {
    const provider = new ScriptedLlmProvider([
      extract({
        emergencyType: EmergencyType.UNCONSCIOUS,
        emergencyTypeConfidence: 0.92,
        consciousness: ConsciousnessState.UNRESPONSIVE,
        questionAnswer: ConsciousnessState.UNRESPONSIVE,
        intent: LlmIntent.ANSWER,
      }),
    ]);

    const result = await interpretTurn({
      incident: openIncident(),
      transcript: 'My friend collapsed and he is not responding',
      protocols: [unconsciousAdultProtocol],
      provider,
      at: AT,
    });

    expect(result.incident.state.emergencyType).toBe(EmergencyType.UNCONSCIOUS);
    expect(result.incident.state.patient.consciousness).toBe(ConsciousnessState.UNRESPONSIVE);
    expect(result.incident.state.currentProtocolId).toBe(unconsciousAdultProtocol.id);
    expect(result.source).toBe('protocol');
    expect(result.reply).toBe('Call emergency services now. Put the phone on speaker if you can.');
    expect(result.incident.state.actions[0]?.instruction).toBe(result.reply);
  });

  it('rejects malformed model output and does not change the incident', async () => {
    const incident = openIncident();
    const provider = new ScriptedLlmProvider(['not-json']);

    await expect(
      interpretTurn({
        incident,
        transcript: 'He collapsed',
        protocols: [unconsciousAdultProtocol],
        provider,
        at: AT,
      }),
    ).rejects.toBeInstanceOf(AiValidationError);

    expect(incident.state.emergencyType).toBe(EmergencyType.UNKNOWN);
    expect(incident.state.currentProtocolId).toBeNull();
  });

  it('rejects invented medical guidance on the model payload', async () => {
    const incident = openIncident();
    const provider = new ScriptedLlmProvider([
      JSON.stringify({
        ...extract({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.8,
        }),
        instruction: 'Give him two aspirin and water',
      }),
    ]);

    await expect(
      interpretTurn({
        incident,
        transcript: 'Should I give him aspirin?',
        protocols: [unconsciousAdultProtocol],
        provider,
        at: AT,
      }),
    ).rejects.toBeInstanceOf(AiValidationError);

    expect(incident.state.actions).toHaveLength(0);
  });

  it('does not turn an unsupported request into an invented instruction', async () => {
    const first = await interpretTurn({
      incident: openIncident(),
      transcript: 'He collapsed and is not responding',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.9,
          consciousness: ConsciousnessState.UNRESPONSIVE,
          questionAnswer: ConsciousnessState.UNRESPONSIVE,
          intent: LlmIntent.ANSWER,
        }),
      ]),
      at: AT,
    });

    const second = await interpretTurn({
      incident: first.incident,
      transcript: 'Should I pour water in his mouth?',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyTypeConfidence: 0,
          intent: LlmIntent.UNSUPPORTED,
          unsupportedRequest: 'Give food or drink',
        }),
      ]),
      at: AT,
    });

    expect(second.source).toBe('safe_fallback');
    expect(second.reply.startsWith(SAFE_PHRASES.cannotInvent)).toBe(true);
    expect(second.reply).toContain('Call emergency services now');
    expect(second.reply.toLowerCase()).not.toContain('water');
    expect(second.incident.state.actions.every((action) => !/water|drink|aspirin/i.test(action.instruction))).toBe(
      true,
    );
  });

  it('does not invent treatment for an unpublished emergency type', async () => {
    const result = await interpretTurn({
      incident: openIncident(),
      transcript: 'There is a bad burn on her arm',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyType: EmergencyType.BURN,
          emergencyTypeConfidence: 0.88,
          intent: LlmIntent.REQUEST_HELP,
        }),
      ]),
      at: AT,
    });

    expect(result.incident.state.emergencyType).toBe(EmergencyType.BURN);
    expect(result.incident.state.currentProtocolId).toBeNull();
    expect(result.source).toBe('safe_fallback');
    expect(result.reply).toBe(SAFE_PHRASES.unsupportedEmergency);
    expect(result.incident.state.actions).toHaveLength(0);
  });

  it('interprets a non-English utterance from structured extraction, not from model prose', async () => {
    const result = await interpretTurn({
      incident: initialIncident({
        id: 'incident-am',
        sessionId: 'session-am',
        language: Language.AMHARIC,
        at: AT,
      }),
      transcript: 'ወደቀ፣ አይመልስም',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.85,
          consciousness: ConsciousnessState.UNRESPONSIVE,
          questionAnswer: ConsciousnessState.UNRESPONSIVE,
          intent: LlmIntent.ANSWER,
        }),
      ]),
      at: AT,
    });

    expect(result.incident.state.patient.consciousness).toBe(ConsciousnessState.UNRESPONSIVE);
    expect(result.source).toBe('protocol');
    expect(result.reply).toBe(unconsciousAdultProtocol.steps[1]?.prompt[Language.AMHARIC]);
    expect(result.incident.state.actions[0]?.instruction).toBe(result.reply);
  });

  it('speaks Afaan Oromoo protocol lines to an Afaan Oromoo incident', async () => {
    const result = await interpretTurn({
      incident: initialIncident({
        id: 'incident-om',
        sessionId: 'session-om',
        language: Language.AFAAN_OROMO,
        at: AT,
      }),
      transcript: 'Hiriyaan koo kufe, deebii hin kennu',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.85,
          consciousness: ConsciousnessState.UNRESPONSIVE,
          questionAnswer: ConsciousnessState.UNRESPONSIVE,
          intent: LlmIntent.ANSWER,
        }),
      ]),
      at: AT,
    });

    expect(result.source).toBe('protocol');
    expect(result.reply).toBe(unconsciousAdultProtocol.steps[1]?.prompt[Language.AFAAN_OROMO]);
  });

  it('keeps browser coordinates when the user later describes the location', async () => {
    const incident = openIncident();
    incident.state.location = {
      description: null,
      latitude: 9.0108,
      longitude: 38.7613,
      accuracyMeters: 25,
      certainty: Certainty.KNOWN,
      reportedAt: AT,
    };

    const result = await interpretTurn({
      incident,
      transcript: 'We are in Bole near Edna Mall',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([extract({ locationDescription: 'Bole, near Edna Mall' })]),
      at: AT,
    });

    expect(result.incident.state.location).toMatchObject({
      description: 'Bole, near Edna Mall',
      latitude: 9.0108,
      longitude: 38.7613,
      accuracyMeters: 25,
    });
  });

  it('uses the incident language for safe fallback phrases', async () => {
    const result = await interpretTurn({
      incident: initialIncident({
        id: 'incident-om-burn',
        sessionId: 'session-om-burn',
        language: Language.AFAAN_OROMO,
        at: AT,
      }),
      transcript: 'Harki ishee gubate',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({ emergencyType: EmergencyType.BURN, emergencyTypeConfidence: 0.8 }),
      ]),
      at: AT,
    });

    expect(result.source).toBe('safe_fallback');
    expect(result.reply).toBe(safePhrases(Language.AFAAN_OROMO).unsupportedEmergency);
  });

  it('confirms a protocol action and speaks the next protocol step', async () => {
    const afterReport = await interpretTurn({
      incident: openIncident(),
      transcript: 'He is not responding',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.9,
          consciousness: ConsciousnessState.UNRESPONSIVE,
          questionAnswer: ConsciousnessState.UNRESPONSIVE,
          intent: LlmIntent.ANSWER,
        }),
      ]),
      at: AT,
    });

    const afterConfirm = await interpretTurn({
      incident: afterReport.incident,
      transcript: 'Yes I called them',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyTypeConfidence: 0,
          intent: LlmIntent.CONFIRM_ACTION,
          actionStatus: 'confirmed',
        }),
      ]),
      at: AT,
    });

    expect(afterConfirm.incident.state.currentStepId).toBe('step-open-airway');
    expect(afterConfirm.reply).toBe('Tilt the head back and lift the chin to open the airway.');
    expect(afterConfirm.source).toBe('protocol');
  });

  it('sends an uncertain breathing answer down the conservative protocol path', async () => {
    const afterReport = await interpretTurn({
      incident: openIncident(),
      transcript: 'He collapsed, no response',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 0.9,
          consciousness: ConsciousnessState.UNRESPONSIVE,
          questionAnswer: ConsciousnessState.UNRESPONSIVE,
          intent: LlmIntent.ANSWER,
        }),
      ]),
      at: AT,
    });

    const afterCall = await interpretTurn({
      incident: afterReport.incident,
      transcript: 'I called',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({ emergencyTypeConfidence: 0, intent: LlmIntent.CONFIRM_ACTION, actionStatus: 'confirmed' }),
      ]),
      at: AT,
    });

    const afterAirway = await interpretTurn({
      incident: afterCall.incident,
      transcript: 'Done',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({ emergencyTypeConfidence: 0, intent: LlmIntent.CONFIRM_ACTION, actionStatus: 'confirmed' }),
      ]),
      at: AT,
    });

    const uncertainBreathing = await interpretTurn({
      incident: afterAirway.incident,
      transcript: 'I cannot tell if he is breathing',
      protocols: [unconsciousAdultProtocol],
      provider: new ScriptedLlmProvider([
        extract({
          emergencyTypeConfidence: 0,
          breathing: BreathingState.UNKNOWN,
          certainty: Certainty.UNKNOWN,
          questionAnswer: 'unknown',
          intent: LlmIntent.ANSWER,
        }),
      ]),
      at: AT,
    });

    expect(uncertainBreathing.incident.state.currentStepId).toBe('step-cpr');
    expect(uncertainBreathing.reply).toContain('centre of the chest');
  });
});
