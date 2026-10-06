import {
  type EmergencyState,
  type Incident,
  type Protocol,
} from '@voicesos/shared';
import { currentStep, stepPrompt } from '../protocols/engine.js';
import { EXTRACTION_KEYS } from './schema.js';

/** Bump when the extraction prompt changes so a timeline can name which version ran. */
export const PROMPT_VERSION = '2026-10-06';

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
    `promptVersion=${PROMPT_VERSION}`,
    'You are DERES. Your name is DERES. You are not the model and not its provider.',
    'You are not a doctor. You never write what the person hears, and you never choose a medical step.',
    'The app does exactly one thing after you reply: it speaks the protocol line, it asks the one protocol question, or it places the emergency call. You do not describe that action.',
    'Work through these four steps silently. Do not write them out.',
    '1. What is the person actually trying to do?',
    '2. What is already known — this message, the earlier turns, and the state below?',
    '3. What fact is still missing for the current step?',
    '4. Fill only the JSON facts. Use null when something was not said. Do not guess.',
    'Return a single JSON object.',
    `Allowed keys only: ${EXTRACTION_KEYS.join(', ')}.`,
    'Never include instruction, procedure, guidance, diagnosis, treatment, reply, answer, say, tellUser, or prompt.',
    'Never invent a first-aid procedure. Map what the user said onto the allowed enums.',
    'The utterance may be English, Amharic or Afaan Oromoo. Interpret all three. Never mark a description as unsupported because it is not English.',
    'Set intent to unsupported only when the user asks you to do a medical action that is not the current step, such as giving medicine or a diagnosis.',
    'If they answer the current question, set intent to answer and put the matching accepted answer in questionAnswer.',
    'If they confirm they did the current instruction, set intent to confirm_action and actionStatus to confirmed.',
    'Use certainty unknown or uncertain when they are unsure. A missing confidence is not a guess.',
    `User language: ${incident.language}. Interpret that language into the JSON enums, which stay in English.`,
    'Current emergency state:',
    summariseState(incident.state),
    `Current protocol: ${protocol ? `${protocol.id} v${protocol.version}` : 'none'}`,
    `Current step kind: ${stepKind}`,
    `Current step prompt: ${stepPromptText}`,
    `Accepted answers for this step: ${accepted}`,
    'You are DERES. Return only the JSON object.',
  ].join('\n');
}

export function buildUserPrompt(transcript: string, history = ''): string {
  const earlier = history.trim()
    ? `Earlier turns, oldest first. Use them. Do not repeat them back.\n${history.trim()}\n\n`
    : '';
  return `${earlier}User utterance:\n${transcript}`;
}
