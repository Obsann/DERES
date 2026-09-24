import {
  type EmergencyState,
  type Incident,
  type Protocol,
} from '@voicesos/shared';
import { currentStep, stepPrompt } from '../protocols/engine.js';
import { EXTRACTION_KEYS } from './schema.js';

function summariseState(state: EmergencyState): string {
  return [
    `emergencyType=${state.emergencyType} (confidence=${state.emergencyTypeConfidence})`,
    `ageGroup=${state.patient.ageGroup}`,
    `consciousness=${state.patient.consciousness}`,
    `breathing=${state.patient.breathing}`,
    `peopleAffected=${state.peopleAffected ?? 'unknown'}`,
    `protocol=${state.currentProtocolId ?? 'none'}`,
    `step=${state.currentStepId ?? 'none'}`,
    `escalation=${state.escalationStatus}`,
    `uncertainty=${state.uncertainty.map((note) => note.field).join(', ') || 'none'}`,
  ].join('\n');
}

export function buildSystemPrompt(incident: Incident, protocol: Protocol | null): string {
  const step = protocol ? currentStep(protocol, incident.state) : null;
  const accepted = step?.acceptedAnswers.length ? step.acceptedAnswers.join(', ') : 'none';
  const stepKind = step?.kind ?? 'none';
  const stepPromptText = step ? stepPrompt(step, incident.language) : 'none';

  return [
    'You are the language component of DERES, a voice-first first-responder system.',
    'You are not a doctor and you are not the medical authority.',
    'Extract structured facts from the user utterance. Return a single JSON object.',
    `Allowed keys only: ${EXTRACTION_KEYS.join(', ')}.`,
    'Never include instruction, procedure, guidance, diagnosis, treatment, reply, say, tellUser, or prompt.',
    'Never invent a first-aid procedure. Map what the user said onto the allowed enums.',
    'If the user asks to do something that is not the current protocol step, set intent to unsupported and put a short label in unsupportedRequest.',
    'If they answer the current question, set intent to answer and put the matching accepted answer in questionAnswer.',
    'If they confirm they did the current instruction, set intent to confirm_action and actionStatus to confirmed.',
    'Use null when a fact was not mentioned. Do not guess. Use certainty unknown or uncertain when they are unsure.',
    `User language: ${incident.language}. Interpret that language into the JSON enums, which stay in English.`,
    'Current emergency state:',
    summariseState(incident.state),
    `Current protocol: ${protocol ? `${protocol.id} v${protocol.version}` : 'none'}`,
    `Current step kind: ${stepKind}`,
    `Current step prompt: ${stepPromptText}`,
    `Accepted answers for this step: ${accepted}`,
  ].join('\n');
}

export function buildUserPrompt(transcript: string): string {
  return `User utterance:\n${transcript}`;
}
