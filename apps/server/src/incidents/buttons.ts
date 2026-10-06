import {
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  MessageRole,
  ProtocolStepKind,
  type ButtonTurnRequest,
  type ProtocolStep,
} from '@voicesos/shared';
import { applyExtraction } from '../ai/orchestrate.js';
import { LlmIntent, type LlmExtraction } from '../ai/schema.js';
import { emptyExtraction } from '../ai/validate.js';
import { ProtocolViolationError, ValidationError } from '../common/errors.js';
import { nowIso } from '../database/ids.js';
import { getIncidentById, insertConversationMessage } from '../database/persist.js';
import { currentStep } from '../protocols/engine.js';
import { publishedProtocols } from '../protocols/catalog.js';
import type { VoiceTurnResult } from '../voice/session.js';
import { commitIncidentMutation } from './apply.js';

const YES_NO: Record<string, { yes: string; no: string }> = {
  'patient.consciousness': { yes: ConsciousnessState.RESPONSIVE, no: ConsciousnessState.UNRESPONSIVE },
  'patient.breathing': { yes: BreathingState.NORMAL, no: BreathingState.ABNORMAL },
};

export function parseButtonTurn(body: unknown): ButtonTurnRequest {
  const record = body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  switch (record['kind']) {
    case 'start':
      if (record['emergency'] === 'collapsed') return { kind: 'start', emergency: 'collapsed' };
      break;
    case 'answer':
      if (record['answer'] === 'yes' || record['answer'] === 'no' || record['answer'] === 'unsure') {
        return { kind: 'answer', answer: record['answer'] };
      }
      break;
    case 'action':
      if (record['status'] === 'confirmed' || record['status'] === 'unable') {
        return { kind: 'action', status: record['status'] };
      }
      break;
    case 'repeat':
      return { kind: 'repeat' };
  }
  throw new ValidationError('Invalid button press', [
    { path: 'kind', message: 'must be start, answer, action or repeat with a valid value' },
  ]);
}

function answerExtraction(step: ProtocolStep | null, answer: 'yes' | 'no' | 'unsure'): LlmExtraction {
  if (!step || (step.kind !== ProtocolStepKind.QUESTION && step.kind !== ProtocolStepKind.ASSESSMENT)) {
    throw new ProtocolViolationError('The current step is not a question', { stepId: step?.id ?? null });
  }
  if (answer === 'unsure') {
    return emptyExtraction({ intent: LlmIntent.ANSWER, certainty: Certainty.UNKNOWN });
  }
  const mapping = step.updatesField ? YES_NO[step.updatesField] : undefined;
  if (!mapping) {
    throw new ProtocolViolationError('This question cannot be answered with yes or no', { stepId: step.id });
  }
  return emptyExtraction({ intent: LlmIntent.ANSWER, certainty: Certainty.KNOWN, questionAnswer: mapping[answer] });
}

/** The server, not the client, turns a press into protocol facts. */
export function buttonExtraction(
  press: ButtonTurnRequest,
  step: ProtocolStep | null,
): { extraction: LlmExtraction; label: string } {
  switch (press.kind) {
    case 'start':
      return {
        extraction: emptyExtraction({
          intent: LlmIntent.REQUEST_HELP,
          certainty: Certainty.KNOWN,
          emergencyType: EmergencyType.UNCONSCIOUS,
          emergencyTypeConfidence: 1,
        }),
        label: 'Someone has collapsed',
      };
    case 'answer':
      return {
        extraction: answerExtraction(step, press.answer),
        label: press.answer === 'unsure' ? 'Not sure' : press.answer === 'yes' ? 'Yes' : 'No',
      };
    case 'action':
      return {
        extraction: emptyExtraction({
          intent: press.status === 'confirmed' ? LlmIntent.CONFIRM_ACTION : LlmIntent.UNABLE_ACTION,
          certainty: Certainty.KNOWN,
          actionStatus: press.status,
        }),
        label: press.status === 'confirmed' ? 'Done' : "I can't",
      };
    case 'repeat':
      return { extraction: emptyExtraction({ intent: LlmIntent.REPEAT }), label: 'Repeat' };
  }
}

/** One button press, following the same path as a voice turn after the model. */
export async function handleButtonTurn(incidentId: string, press: ButtonTurnRequest): Promise<VoiceTurnResult> {
  const incident = await getIncidentById(incidentId);
  const protocol = publishedProtocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;
  const step = protocol ? currentStep(protocol, incident.state) : null;
  const { extraction, label } = buttonExtraction(press, step);

  const result = applyExtraction(incident, extraction, publishedProtocols, nowIso());
  if (press.kind === 'repeat') {
    return { incident, heard: null, reply: result.reply, source: result.source, failure: null };
  }

  const pressedAt = new Date();
  const [, committed] = await Promise.all([
    insertConversationMessage({
      incidentId,
      role: MessageRole.USER,
      transcript: `[button] ${label}`,
      language: incident.language,
      recognitionConfidence: null,
      createdAt: pressedAt.toISOString(),
    }),
    commitIncidentMutation(result.incident, result.events),
    insertConversationMessage({
      incidentId,
      role: MessageRole.ASSISTANT,
      transcript: result.reply,
      language: incident.language,
      recognitionConfidence: null,
      createdAt: new Date(pressedAt.getTime() + 1).toISOString(),
    }),
  ]);

  return { incident: committed.incident, heard: label, reply: result.reply, source: result.source, failure: null };
}
