import { describe, expect, it } from 'vitest';
import { applyButtonGuide, unconsciousAdultProtocol } from '@voicesos/protocols';
import { ActionStatus, Language, type ButtonTurnRequest } from '@voicesos/shared';
import { initialIncident } from '../database/initialState.js';

const AT = '2026-10-06T18:00:00.000Z';
const protocols = [unconsciousAdultProtocol];

describe('applyButtonGuide', () => {
  it('walks the unconscious-adult protocol without the API', () => {
    let incident = initialIncident({
      id: 'local-guide',
      sessionId: 'local-guide',
      language: Language.ENGLISH,
      at: AT,
    });
    const steps: (string | null)[] = [];
    const sequence: ButtonTurnRequest[] = [
      { kind: 'start', emergency: 'collapsed' },
      { kind: 'answer', answer: 'no' },
      { kind: 'action', status: 'confirmed' },
      { kind: 'action', status: 'confirmed' },
      { kind: 'answer', answer: 'no' },
      { kind: 'action', status: 'confirmed' },
    ];
    for (const input of sequence) {
      const result = applyButtonGuide(incident, input, protocols, AT);
      expect(result.source).toBe('protocol');
      incident = result.incident;
      steps.push(incident.state.currentStepId);
    }
    expect(steps).toEqual([
      'step-check-response',
      'step-call-ems',
      'step-open-airway',
      'step-check-breathing',
      'step-cpr',
      'step-wait-for-help',
    ]);
    expect(incident.state.actions.filter((action) => action.status === ActionStatus.CONFIRMED)).toHaveLength(3);
  });

  it('takes the conservative path when the user is not sure', () => {
    let incident = applyButtonGuide(
      initialIncident({ id: 'a', sessionId: 'a', language: Language.ENGLISH, at: AT }),
      { kind: 'start', emergency: 'collapsed' },
      protocols,
      AT,
    ).incident;
    incident = applyButtonGuide(incident, { kind: 'answer', answer: 'unsure' }, protocols, AT).incident;
    expect(incident.state.currentStepId).toBe('step-call-ems');
  });

  it('speaks the protocol line in the incident language', () => {
    const result = applyButtonGuide(
      initialIncident({ id: 'am', sessionId: 'am', language: Language.AMHARIC, at: AT }),
      { kind: 'start', emergency: 'collapsed' },
      protocols,
      AT,
    );
    const step = unconsciousAdultProtocol.steps.find((item) => item.id === 'step-check-response');
    expect(result.reply).toBe(step?.prompt[Language.AMHARIC]);
  });
});
