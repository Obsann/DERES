import {
  ActionStatus,
  AgeGroup,
  BreathingState,
  Certainty,
  ConditionOperator,
  ConsciousnessState,
  EmergencyType,
  EventSource,
  ProtocolStepKind,
  VoiceSessionPhase,
  type ButtonTurnRequest,
  type EmergencyState,
  type Incident,
  type Protocol,
  type ProtocolCondition,
  type ProtocolStep,
  type VoiceTurnResponse,
} from '@voicesos/shared';

/**
 * The button path, without the server or the model.
 *
 * Same presses the API accepts. Used when the bystander still has the
 * protocol on the device but the API is unreachable, so guidance does not
 * stop at the last successful step.
 */

const YES_NO: Record<string, { yes: string; no: string }> = {
  'patient.consciousness': { yes: ConsciousnessState.RESPONSIVE, no: ConsciousnessState.UNRESPONSIVE },
  'patient.breathing': { yes: BreathingState.NORMAL, no: BreathingState.ABNORMAL },
};

const UNKNOWN = new Set<unknown>([
  null,
  undefined,
  EmergencyType.UNKNOWN,
  AgeGroup.UNKNOWN,
  ConsciousnessState.UNKNOWN,
  BreathingState.UNKNOWN,
]);

export class GuideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuideError';
  }
}

export interface GuideTurn {
  incident: Incident;
  reply: string;
  source: 'protocol' | 'safe_fallback';
}

function field(state: EmergencyState, path: string): unknown {
  switch (path) {
    case 'emergencyType':
      return state.emergencyType;
    case 'emergencyTypeConfidence':
      return state.emergencyTypeConfidence;
    case 'peopleAffected':
      return state.peopleAffected;
    case 'patient.ageGroup':
      return state.patient.ageGroup;
    case 'patient.consciousness':
      return state.patient.consciousness;
    case 'patient.breathing':
      return state.patient.breathing;
    case 'currentProtocolId':
      return state.currentProtocolId;
    case 'currentStepId':
      return state.currentStepId;
    case 'escalationStatus':
      return state.escalationStatus;
    case 'location':
      return state.location;
    default:
      return undefined;
  }
}

function holds(state: EmergencyState, conditions: ProtocolCondition[]): boolean {
  return conditions.every((condition) => {
    const actual = field(state, condition.field);
    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return actual === condition.value;
      case ConditionOperator.NOT_EQUALS:
        return actual !== condition.value;
      case ConditionOperator.IN:
        return Array.isArray(condition.value) && condition.value.some((item) => item === actual);
      case ConditionOperator.IS_KNOWN:
        return !UNKNOWN.has(actual);
      case ConditionOperator.IS_UNKNOWN:
        return UNKNOWN.has(actual);
      case ConditionOperator.GREATER_THAN:
        return typeof actual === 'number' && typeof condition.value === 'number' && actual > condition.value;
      case ConditionOperator.LESS_THAN:
        return typeof actual === 'number' && typeof condition.value === 'number' && actual < condition.value;
      default:
        return false;
    }
  });
}

function stepOf(protocol: Protocol, incident: Incident): ProtocolStep | null {
  if (incident.state.currentProtocolId !== protocol.id || incident.state.currentStepId === null) return null;
  return protocol.steps.find((step) => step.id === incident.state.currentStepId) ?? null;
}

function promptOf(step: ProtocolStep, incident: Incident): string {
  return step.prompt[incident.language] ?? step.prompt.en ?? step.label;
}

function nextId(protocol: Protocol, incident: Incident, from: ProtocolStep): string | null {
  const match = from.transitions.find((transition) => holds(incident.state, transition.conditions));
  if (!match) throw new GuideError('No permitted transition from this protocol step');
  return match.toStepId;
}

function touch(incident: Incident, at: string): Incident {
  incident.state.updatedAt = at;
  incident.updatedAt = at;
  return incident;
}

function giveIfNeeded(incident: Incident, protocol: Protocol, step: ProtocolStep, at: string): void {
  if (step.kind !== ProtocolStepKind.ACTION && step.kind !== ProtocolStepKind.ESCALATION) return;
  if (incident.state.actions.some((action) => action.stepId === step.id && action.status === ActionStatus.GIVEN)) {
    return;
  }
  incident.state.actions = [
    ...incident.state.actions,
    {
      id: `local-action-${incident.state.actions.length + 1}`,
      incidentId: incident.id,
      protocolId: protocol.id,
      stepId: step.id,
      instruction: promptOf(step, incident),
      status: ActionStatus.GIVEN,
      givenAt: at,
      confirmedAt: null,
      note: null,
    },
  ];
}

function complete(incident: Incident, stepId: string, nextStepId: string | null, at: string): void {
  incident.state.completedStepIds = [...incident.state.completedStepIds, stepId];
  incident.state.currentStepId = nextStepId;
  touch(incident, at);
}

function protocolFor(incident: Incident, protocols: Protocol[]): Protocol | null {
  if (incident.state.currentProtocolId) {
    return protocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;
  }
  return (
    protocols.find(
      (item) =>
        item.published &&
        item.emergencyType === incident.state.emergencyType &&
        holds(incident.state, item.entryConditions),
    ) ?? null
  );
}

function spoken(incident: Incident, protocol: Protocol | null): GuideTurn {
  const step = protocol ? stepOf(protocol, incident) : null;
  if (step) return { incident, reply: promptOf(step, incident), source: 'protocol' };
  return {
    incident,
    reply: 'Stay with them and call emergency services if you have not already.',
    source: 'safe_fallback',
  };
}

function start(incident: Incident, protocols: Protocol[], at: string): GuideTurn {
  incident.state.emergencyType = EmergencyType.UNCONSCIOUS;
  incident.state.emergencyTypeConfidence = 1;
  const protocol = protocolFor(incident, protocols);
  if (!protocol) throw new GuideError('No published protocol for this emergency');
  incident.state.currentProtocolId = protocol.id;
  if (incident.state.currentStepId === null) incident.state.currentStepId = protocol.initialStepId;
  const step = stepOf(protocol, incident);
  if (step) giveIfNeeded(incident, protocol, step, at);
  return spoken(touch(incident, at), protocol);
}

function answer(incident: Incident, protocol: Protocol, value: 'yes' | 'no' | 'unsure', at: string): GuideTurn {
  const step = stepOf(protocol, incident);
  if (!step || (step.kind !== ProtocolStepKind.QUESTION && step.kind !== ProtocolStepKind.ASSESSMENT)) {
    throw new GuideError('The current step is not a question');
  }

  const unsure = value === 'unsure';
  const mapping = step.updatesField ? YES_NO[step.updatesField] : undefined;
  if (!unsure && !mapping) throw new GuideError('This question cannot be answered with yes or no');
  const mapped = unsure ? 'unknown' : mapping?.[value];
  if (!mapped) throw new GuideError('This question cannot be answered with yes or no');

  incident.state.relevantAnswers = [
    ...incident.state.relevantAnswers,
    {
      questionId: step.id,
      question: promptOf(step, incident),
      answer: mapped,
      certainty: unsure ? Certainty.UNCERTAIN : Certainty.KNOWN,
      source: EventSource.USER,
      recordedAt: at,
    },
  ];

  if (unsure) {
    incident.state.uncertainty = [
      ...incident.state.uncertainty,
      {
        field: step.updatesField ?? `steps.${step.id}`,
        reason: `User could not answer "${step.label}"`,
        source: EventSource.USER,
        recordedAt: at,
      },
    ];
  } else if (step.updatesField === 'patient.consciousness') {
    incident.state.patient = { ...incident.state.patient, consciousness: mapped as ConsciousnessState };
  } else if (step.updatesField === 'patient.breathing') {
    incident.state.patient = { ...incident.state.patient, breathing: mapped as BreathingState };
  }

  const target = unsure ? step.onUncertain : nextId(protocol, incident, step);
  if (unsure && target === null) throw new GuideError('This step has no safe path for an uncertain answer');
  complete(incident, step.id, target ?? null, at);
  const next = stepOf(protocol, incident);
  if (next) giveIfNeeded(incident, protocol, next, at);
  return spoken(incident, protocol);
}

function resolveAction(
  incident: Incident,
  protocol: Protocol,
  status: 'confirmed' | 'unable',
  at: string,
): GuideTurn {
  const step = stepOf(protocol, incident);
  if (!step) throw new GuideError('No active protocol step');
  if (!step.requiresConfirmation) throw new GuideError('This step does not require confirmation');

  const given = incident.state.actions.find(
    (action) => action.stepId === step.id && action.status === ActionStatus.GIVEN,
  );
  if (!given) throw new GuideError('No outstanding action to confirm');

  incident.state.actions = incident.state.actions.map((action) =>
    action.id === given.id
      ? {
          ...action,
          status: status === 'confirmed' ? ActionStatus.CONFIRMED : ActionStatus.UNABLE,
          confirmedAt: status === 'confirmed' ? at : action.confirmedAt,
        }
      : action,
  );

  const target =
    status === 'confirmed' ? nextId(protocol, incident, step) : (step.onUncertain ?? nextId(protocol, incident, step));
  complete(incident, step.id, target, at);
  const next = stepOf(protocol, incident);
  if (next) giveIfNeeded(incident, protocol, next, at);
  return spoken(incident, protocol);
}

/** One button press against a local copy of the incident. Does not persist. */
export function applyButtonGuide(
  incident: Incident,
  press: ButtonTurnRequest,
  protocols: Protocol[],
  at: string = new Date().toISOString(),
): GuideTurn {
  const next = structuredClone(incident);
  if (press.kind === 'start') return start(next, protocols, at);

  const protocol = protocolFor(next, protocols);
  if (press.kind === 'repeat') return spoken(next, protocol);
  if (!protocol) throw new GuideError('No published protocol for this emergency');

  if (press.kind === 'answer') return answer(next, protocol, press.answer, at);
  return resolveAction(next, protocol, press.status, at);
}

export function toLocalVoiceTurn(incident: Incident, turn: GuideTurn): VoiceTurnResponse {
  return {
    incidentId: incident.id,
    voiceSessionId: incident.sessionId,
    phase:
      incident.state.actions.some((action) => action.status === ActionStatus.GIVEN)
        ? VoiceSessionPhase.AWAITING_CONFIRMATION
        : VoiceSessionPhase.SPEAKING,
    heard: null,
    reply: turn.reply,
    source: turn.source,
    failure: null,
    capability: incident.state.currentStepId === 'step-call-ems' ? 'place_call' : null,
  };
}
