import { describe, expect, it } from 'vitest';
import { unconsciousAdultProtocol } from '@voicesos/protocols';
import { ActionStatus, Language, type ButtonTurnRequest, type Incident } from '@voicesos/shared';
import { applyExtraction } from '../ai/orchestrate.js';
import { ProtocolViolationError, ValidationError } from '../common/errors.js';
import { initialIncident } from '../database/initialState.js';
import { currentStep } from '../protocols/engine.js';
import { buttonExtraction, parseButtonTurn } from './buttons.js';

const AT = '2026-10-06T09:00:00.000Z';
const protocols = [unconsciousAdultProtocol];

function press(incident: Incident, input: ButtonTurnRequest) {
  const step = incident.state.currentProtocolId ? currentStep(unconsciousAdultProtocol, incident.state) : null;
  const { extraction } = buttonExtraction(input, step);
  return applyExtraction(incident, extraction, protocols, AT);
}

function openIncident(language: Language = Language.ENGLISH) {
  return initialIncident({ id: 'incident-buttons', sessionId: 'session-buttons', language, at: AT });
}

describe('button turns', () => {
  it('walks the unconscious-adult protocol to the exit without the model', () => {
    let incident = openIncident();
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
      const result = press(incident, input);
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
    let incident = press(openIncident(), { kind: 'start', emergency: 'collapsed' }).incident;
    incident = press(incident, { kind: 'answer', answer: 'unsure' }).incident;
    expect(incident.state.currentStepId).toBe('step-call-ems');
    expect(incident.state.uncertainty.length).toBeGreaterThan(0);
  });

  it('speaks the protocol line in the incident language', () => {
    const result = press(openIncident(Language.AMHARIC), { kind: 'start', emergency: 'collapsed' });
    const step = unconsciousAdultProtocol.steps.find((item) => item.id === 'step-check-response');
    expect(result.reply).toBe(step?.prompt[Language.AMHARIC]);
  });

  it('repeats the current line without changing state', () => {
    const started = press(openIncident(), { kind: 'start', emergency: 'collapsed' }).incident;
    const repeated = press(started, { kind: 'repeat' });
    expect(repeated.events).toHaveLength(0);
    expect(repeated.incident).toBe(started);
  });

  it('refuses a yes/no answer while an action is outstanding', () => {
    let incident = press(openIncident(), { kind: 'start', emergency: 'collapsed' }).incident;
    incident = press(incident, { kind: 'answer', answer: 'no' }).incident;
    expect(() => press(incident, { kind: 'answer', answer: 'yes' })).toThrow(ProtocolViolationError);
  });

  it('rejects malformed presses', () => {
    expect(() => parseButtonTurn({ kind: 'answer', answer: 'maybe' })).toThrow(ValidationError);
    expect(() => parseButtonTurn({ kind: 'instruction', text: 'do CPR' })).toThrow(ValidationError);
    expect(parseButtonTurn({ kind: 'action', status: 'unable' })).toEqual({ kind: 'action', status: 'unable' });
  });
});
