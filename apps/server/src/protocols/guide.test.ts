import { describe, expect, it } from 'vitest';
import { applyButtonGuide, publishedProtocols, unconsciousAdultProtocol } from '@voicesos/protocols';
import { ActionStatus, Language, type ButtonTurnRequest } from '@voicesos/shared';
import { initialIncident } from '../database/initialState.js';

const AT = '2026-10-06T18:00:00.000Z';
const protocols = publishedProtocols;

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

  it('starts the trauma protocol for a crash, not chest compressions', () => {
    const result = applyButtonGuide(
      initialIncident({ id: 'crash', sessionId: 'crash', language: Language.ENGLISH, at: AT }),
      { kind: 'start', emergency: 'crash' },
      protocols,
      AT,
    );
    expect(result.source).toBe('protocol');
    expect(result.incident.state.emergencyType).toBe('traumatic_injury');
    expect(result.incident.state.currentProtocolId).toBe('protocol-traumatic-injury');
    expect(result.incident.state.currentStepId).toBe('step-trauma-call-ems');
    expect(result.reply.toLowerCase()).not.toContain('chest');
  });

  it('starts FAST then stays on the stroke path', () => {
    let incident = applyButtonGuide(
      initialIncident({ id: 'stroke', sessionId: 'stroke', language: Language.ENGLISH, at: AT }),
      { kind: 'start', emergency: 'stroke' },
      protocols,
      AT,
    ).incident;
    incident = applyButtonGuide(incident, { kind: 'action', status: 'confirmed' }, protocols, AT).incident;
    incident = applyButtonGuide(incident, { kind: 'answer', answer: 'no' }, protocols, AT).incident;
    expect(incident.state.currentProtocolId).toBe('protocol-suspected-stroke');
    expect(incident.state.currentStepId).toBe('step-fast-arms');
  });

  it('starts choking maneuvers, not CPR', () => {
    const result = applyButtonGuide(
      initialIncident({ id: 'choke', sessionId: 'choke', language: Language.ENGLISH, at: AT }),
      { kind: 'start', emergency: 'choking' },
      protocols,
      AT,
    );
    expect(result.source).toBe('protocol');
    expect(result.incident.state.currentProtocolId).toBe('protocol-choking');
    expect(result.reply.toLowerCase()).toContain('chok');
  });

  it('escalates something else without a protocol', () => {
    const result = applyButtonGuide(
      initialIncident({ id: 'other', sessionId: 'other', language: Language.ENGLISH, at: AT }),
      { kind: 'start', emergency: 'other' },
      protocols,
      AT,
    );
    expect(result.source).toBe('safe_fallback');
    expect(result.incident.state.currentProtocolId).toBeNull();
  });
});
