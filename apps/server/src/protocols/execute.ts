import {
  ActionStatus,
  Certainty,
  EscalationState,
  EventSource,
  ProtocolStepKind,
  type Id,
  type Incident,
  type IsoDateTime,
  type Protocol,
  type ProtocolStep,
} from '@voicesos/shared';
import { ProtocolViolationError, ValidationError } from '../common/errors.js';
import { applyCommand, type TransitionResult } from '../incidents/stateEngine.js';
import {
  assertActionPermitted,
  assertProtocolSelectable,
  currentStep,
  findProtocolStep,
  matchingEscalation,
  nextStepId,
  stepPrompt,
} from './engine.js';

function merge(results: TransitionResult[]): TransitionResult {
  const last = results.at(-1);
  if (!last) {
    throw new ProtocolViolationError('Protocol produced no state change');
  }
  return {
    incident: last.incident,
    events: results.flatMap((result) => result.events),
  };
}

function applyAll(incident: Incident, at: IsoDateTime, apply: (current: Incident) => TransitionResult[]): TransitionResult {
  return merge(apply(incident));
}

function requireCurrentStep(protocol: Protocol, incident: Incident): ProtocolStep {
  const step = currentStep(protocol, incident.state);
  if (!step) {
    throw new ProtocolViolationError('No active protocol step', {
      protocolId: protocol.id,
      currentProtocolId: incident.state.currentProtocolId,
    });
  }
  return step;
}

function maybeEscalate(incident: Incident, protocol: Protocol, at: IsoDateTime): TransitionResult | null {
  const rule = matchingEscalation(protocol, incident.state);
  if (!rule) return null;
  if (incident.state.escalationStatus === EscalationState.ESCALATED) return null;
  if (rule.escalateTo === EscalationState.NONE) return null;
  if (
    rule.escalateTo === EscalationState.RECOMMENDED &&
    incident.state.escalationStatus !== EscalationState.NONE
  ) {
    return null;
  }

  try {
    return applyCommand(
      incident,
      {
        kind: 'escalate',
        to: rule.escalateTo,
        reason: rule.reason,
        source: EventSource.PROTOCOL,
      },
      at,
    );
  } catch {
    return null;
  }
}

/** Select a published protocol and land on its first step. */
export function startProtocol(incident: Incident, protocol: Protocol, at: IsoDateTime): TransitionResult {
  assertProtocolSelectable(protocol, incident.state);
  const selected = applyCommand(
    incident,
    {
      kind: 'select_protocol',
      protocolId: protocol.id,
      initialStepId: protocol.initialStepId,
      source: EventSource.PROTOCOL,
    },
    at,
  );
  const escalated = maybeEscalate(selected.incident, protocol, at);
  return escalated ? merge([selected, escalated]) : selected;
}

/**
 * Record the user's answer to the current QUESTION/ASSESSMENT step and move
 * along the first permitted transition. Uncertain answers follow `onUncertain`.
 */
export function answerProtocolStep(
  incident: Incident,
  protocol: Protocol,
  input: { answer: string; certainty: Certainty; questionId?: Id | null },
  at: IsoDateTime,
): TransitionResult {
  const step = requireCurrentStep(protocol, incident);
  if (step.kind !== ProtocolStepKind.QUESTION && step.kind !== ProtocolStepKind.ASSESSMENT) {
    throw new ProtocolViolationError('The current step is not waiting for an answer', {
      stepId: step.id,
      kind: step.kind,
    });
  }

  const answer = input.answer.trim();
  if (!answer) {
    throw new ValidationError('answer is required', [{ path: 'answer', message: 'required' }]);
  }

  const uncertain =
    input.certainty === Certainty.UNCERTAIN ||
    input.certainty === Certainty.UNKNOWN ||
    /^(unknown|unsure|i don't know|not sure)$/i.test(answer);

  if (!uncertain && step.acceptedAnswers.length > 0 && !step.acceptedAnswers.includes(answer)) {
    throw new ProtocolViolationError('Answer is not accepted for this protocol step', {
      stepId: step.id,
      answer,
    });
  }

  return applyAll(incident, at, (current) => {
    const results: TransitionResult[] = [];
    let latest = current;

    const recorded = applyCommand(
      latest,
      {
        kind: 'record_answer',
        questionId: input.questionId ?? step.id,
        question: stepPrompt(step, incident.language),
        answer,
        certainty: uncertain ? Certainty.UNCERTAIN : input.certainty,
        source: EventSource.USER,
        ...(step.updatesField && !uncertain
          ? {
              updatesField: step.updatesField as
                | 'emergencyType'
                | 'peopleAffected'
                | 'patient.ageGroup'
                | 'patient.consciousness'
                | 'patient.breathing',
              updatesValue: answer,
            }
          : {}),
      },
      at,
    );
    results.push(recorded);
    latest = recorded.incident;

    if (uncertain) {
      const note = applyCommand(
        latest,
        {
          kind: 'record_uncertainty',
          field: step.updatesField ?? `steps.${step.id}`,
          reason: `User could not answer "${step.label}"`,
          source: EventSource.USER,
        },
        at,
      );
      results.push(note);
      latest = note.incident;
    }

    const target = uncertain ? step.onUncertain : nextStepId(protocol, latest.state, step.id);
    if (uncertain && target === null) {
      throw new ProtocolViolationError('This step has no safe path for an uncertain answer', {
        stepId: step.id,
      });
    }
    if (target === undefined) {
      throw new ProtocolViolationError('No permitted transition from this protocol step', { stepId: step.id });
    }

    const advanced = applyCommand(
      latest,
      {
        kind: 'complete_step',
        stepId: step.id,
        nextStepId: target,
        source: EventSource.PROTOCOL,
      },
      at,
    );
    results.push(advanced);
    latest = advanced.incident;

    const escalated = maybeEscalate(latest, protocol, at);
    if (escalated) results.push(escalated);

    return results;
  });
}

/** Deliver the current ACTION/ESCALATION instruction. The LLM cannot invent one. */
export function giveProtocolAction(incident: Incident, protocol: Protocol, at: IsoDateTime): TransitionResult {
  const step = requireCurrentStep(protocol, incident);
  if (step.kind !== ProtocolStepKind.ACTION && step.kind !== ProtocolStepKind.ESCALATION) {
    throw new ProtocolViolationError('The current step is not an instruction', {
      stepId: step.id,
      kind: step.kind,
    });
  }

  const instruction = stepPrompt(step, incident.language);
  assertActionPermitted(protocol, incident.state, instruction);

  const alreadyGiven = incident.state.actions.some(
    (action) => action.stepId === step.id && action.status === ActionStatus.GIVEN,
  );
  if (alreadyGiven) {
    throw new ProtocolViolationError('This instruction has already been given', { stepId: step.id });
  }

  return applyCommand(
    incident,
    {
      kind: 'give_action',
      protocolId: protocol.id,
      stepId: step.id,
      instruction,
      source: EventSource.PROTOCOL,
    },
    at,
  );
}

export function rejectUnsupportedAction(
  incident: Incident,
  protocol: Protocol,
  instruction: string,
): never {
  assertActionPermitted(protocol, incident.state, instruction);
  throw new ProtocolViolationError('Instruction is not the current protocol action', {
    protocolId: protocol.id,
    currentStepId: incident.state.currentStepId,
    instruction,
  });
}

/** Confirm, mark unable, or skip the outstanding action, then advance. */
export function resolveProtocolAction(
  incident: Incident,
  protocol: Protocol,
  status: Extract<ActionStatus, 'confirmed' | 'unable' | 'skipped'>,
  at: IsoDateTime,
  note: string | null = null,
): TransitionResult {
  const step = requireCurrentStep(protocol, incident);
  if (!step.requiresConfirmation) {
    throw new ProtocolViolationError('This step does not require confirmation', { stepId: step.id });
  }

  const given = incident.state.actions.find(
    (action) => action.stepId === step.id && action.status === ActionStatus.GIVEN,
  );
  if (!given) {
    throw new ProtocolViolationError('No outstanding action to confirm', { stepId: step.id });
  }

  return applyAll(incident, at, (current) => {
    const results: TransitionResult[] = [];
    const resolved = applyCommand(
      current,
      {
        kind: 'resolve_action',
        actionId: given.id,
        status,
        note,
        source: EventSource.USER,
      },
      at,
    );
    results.push(resolved);

    const target =
      status === ActionStatus.CONFIRMED
        ? nextStepId(protocol, resolved.incident.state, step.id)
        : step.onUncertain ?? nextStepId(protocol, resolved.incident.state, step.id);

    const advanced = applyCommand(
      resolved.incident,
      {
        kind: 'complete_step',
        stepId: step.id,
        nextStepId: target,
        source: EventSource.PROTOCOL,
      },
      at,
    );
    results.push(advanced);

    const escalated = maybeEscalate(advanced.incident, protocol, at);
    if (escalated) results.push(escalated);

    return results;
  });
}

export function requireStepKind(protocol: Protocol, stepId: Id, kind: ProtocolStepKind): ProtocolStep {
  const step = findProtocolStep(protocol, stepId);
  if (step.kind !== kind) {
    throw new ProtocolViolationError(`Step '${stepId}' is not a ${kind} step`, { stepId, kind: step.kind });
  }
  return step;
}
