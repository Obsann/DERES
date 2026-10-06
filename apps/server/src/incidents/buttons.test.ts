import { describe, expect, it } from 'vitest';
import { publishedProtocols, unconsciousAdultProtocol } from '@voicesos/protocols';
import { ActionStatus, Language, type ButtonTurnRequest, type Incident } from '@voicesos/shared';
import { applyExtraction } from '../ai/orchestrate.js';
import { ProtocolViolationError, ValidationError } from '../common/errors.js';
import { initialIncident } from '../database/initialState.js';
import { currentStep } from '../protocols/engine.js';
import { buttonExtraction, parseButtonTurn } from './buttons.js';

const AT = '2026-10-06T09:00:00.000Z';
const protocols = publishedProtocols;

function press(incident: Incident, input: ButtonTurnRequest) {
  const protocol = publishedProtocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;
  const step = protocol ? currentStep(protocol, incident.state) : null;
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

  it('starts the trauma protocol for a crash, not chest compressions', () => {
    const result = press(openIncident(), { kind: 'start', emergency: 'crash' });
    expect(result.incident.state.emergencyType).toBe('traumatic_injury');
    expect(result.incident.state.currentProtocolId).toBe('protocol-traumatic-injury');
    expect(result.incident.state.currentStepId).toBe('step-trauma-call-ems');
    expect(result.source).toBe('protocol');
    expect(result.reply.toLowerCase()).not.toContain('chest');
  });

  it('starts FAST stroke guidance, not the collapse protocol', () => {
    const result = press(openIncident(), { kind: 'start', emergency: 'stroke' });
    expect(result.incident.state.emergencyType).toBe('suspected_stroke');
    expect(result.incident.state.currentProtocolId).toBe('protocol-suspected-stroke');
    expect(result.incident.state.currentStepId).toBe('step-stroke-call-ems');
    expect(result.reply.toLowerCase()).toContain('stroke');
    expect(result.reply.toLowerCase()).not.toContain('compress');
  });

  it('walks FAST observational answers without switching to CPR', () => {
    let incident = press(openIncident(), { kind: 'start', emergency: 'stroke' }).incident;
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    incident = press(incident, { kind: 'answer', answer: 'no' }).incident;
    incident = press(incident, { kind: 'answer', answer: 'no' }).incident;
    incident = press(incident, { kind: 'answer', answer: 'no' }).incident;
    expect(incident.state.currentStepId).toBe('step-stroke-stay');
    expect(incident.state.currentProtocolId).toBe('protocol-suspected-stroke');
    expect(incident.state.relevantAnswers).toHaveLength(3);
  });

  it('walks choking back blows then abdominal thrusts, not compressions', () => {
    let incident = press(openIncident(), { kind: 'start', emergency: 'choking' }).incident;
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    expect(incident.state.currentStepId).toBe('step-back-blows');
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    expect(incident.state.currentStepId).toBe('step-abdominal-thrusts');
  });

  it('walks bleeding pressure then packing, not cooling or CPR', () => {
    let incident = press(openIncident(), { kind: 'start', emergency: 'bleeding' }).incident;
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    expect(incident.state.currentStepId).toBe('step-direct-pressure');
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    expect(incident.state.currentStepId).toBe('step-pack-wound');
  });

  it('walks burn cooling, not a tourniquet', () => {
    let incident = press(openIncident(), { kind: 'start', emergency: 'burns' }).incident;
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    expect(incident.state.currentStepId).toBe('step-cool-burn');
    expect(incident.state.actions.some((action) => /tourniquet|compress/i.test(action.instruction))).toBe(false);
  });

  it('walks trauma do-not-move, not chest compressions', () => {
    let incident = press(openIncident(), { kind: 'start', emergency: 'crash' }).incident;
    incident = press(incident, { kind: 'action', status: 'confirmed' }).incident;
    expect(incident.state.currentStepId).toBe('step-dont-move');
    expect(incident.state.actions.some((action) => /chest/i.test(action.instruction))).toBe(false);
  });

  it('starts choking maneuvers, not FAST or CPR', () => {
    const result = press(openIncident(), { kind: 'start', emergency: 'choking' });
    expect(result.incident.state.currentProtocolId).toBe('protocol-choking');
    expect(result.incident.state.currentStepId).toBe('step-choke-call-ems');
  });

  it('starts bleeding pressure, not cooling or compressions', () => {
    const result = press(openIncident(), { kind: 'start', emergency: 'bleeding' });
    expect(result.incident.state.currentProtocolId).toBe('protocol-severe-bleeding');
    expect(result.incident.state.currentStepId).toBe('step-bleed-call-ems');
  });

  it('starts burn cooling, not tourniquet or CPR', () => {
    const result = press(openIncident(), { kind: 'start', emergency: 'burns' });
    expect(result.incident.state.currentProtocolId).toBe('protocol-burns');
    expect(result.incident.state.currentStepId).toBe('step-burn-call-ems');
  });

  it('escalates something else without inventing a procedure', () => {
    const result = press(openIncident(), { kind: 'start', emergency: 'other' });
    expect(result.incident.state.currentProtocolId).toBeNull();
    expect(result.source).toBe('safe_fallback');
    expect(result.reply.toLowerCase()).toContain('call emergency services');
  });
});
