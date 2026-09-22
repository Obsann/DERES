import {
  ActionStatus,
  AgeGroup,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  IncidentEventType,
  IncidentStatus,
  type ActionRecord,
  type EmergencyState,
  type Id,
  type Incident,
  type IsoDateTime,
  type RecordedAnswer,
  type UncertaintyNote,
} from '@voicesos/shared';
import { InvalidStateTransitionError, ValidationError } from '../common/errors.js';
import { createId } from '../database/ids.js';
import type { IncidentCommand } from './commands.js';

export interface EngineEvent {
  type: IncidentEventType;
  source: EventSource;
  summary: string;
  payload: Record<string, unknown> | null;
}

export interface TransitionResult {
  incident: Incident;
  events: EngineEvent[];
}

const ESCALATION_RANK: Record<EscalationState, number> = {
  [EscalationState.NONE]: 0,
  [EscalationState.RECOMMENDED]: 1,
  [EscalationState.ESCALATED]: 2,
};

const PATIENT_ENUMS = {
  ageGroup: new Set<string>(Object.values(AgeGroup)),
  consciousness: new Set<string>(Object.values(ConsciousnessState)),
  breathing: new Set<string>(Object.values(BreathingState)),
} as const;

type StructuredField =
  | 'emergencyType'
  | 'peopleAffected'
  | 'patient.ageGroup'
  | 'patient.consciousness'
  | 'patient.breathing';

/**
 * Apply one command to an incident.
 *
 * Pure: the input is not mutated. Invalid transitions throw
 * {@link InvalidStateTransitionError}; missing or malformed fields throw
 * {@link ValidationError}. Timeline events are returned so the caller can
 * append them; they are never written over earlier events.
 */
export function applyCommand(
  incident: Incident,
  command: IncidentCommand,
  at: IsoDateTime,
): TransitionResult {
  assertMutable(incident, command);

  const next = structuredClone(incident);
  const events: EngineEvent[] = [];
  const emit = (event: EngineEvent) => {
    events.push(event);
  };

  switch (command.kind) {
    case 'set_emergency_type':
      applyEmergencyType(next.state, command.emergencyType, command.confidence, command.source, at, emit);
      break;
    case 'set_location':
      applyLocation(next.state, command.location, command.source, at, emit);
      break;
    case 'set_people_affected':
      applyPeopleAffected(next.state, command.peopleAffected, command.source, at, emit);
      break;
    case 'set_patient_fact':
      applyPatientFact(next.state, command.field, command.value, command.source, at, emit);
      break;
    case 'add_symptom':
      applyListAdd(next.state, 'majorSymptoms', command.symptom, command.source, at, emit);
      break;
    case 'add_observation':
      applyListAdd(next.state, 'relevantObservations', command.observation, command.source, at, emit);
      break;
    case 'record_answer':
      applyAnswer(next.state, command, at, emit);
      break;
    case 'select_protocol':
      applySelectProtocol(next.state, command.protocolId, command.initialStepId, command.source, at, emit);
      break;
    case 'complete_step':
      applyCompleteStep(next.state, command.stepId, command.nextStepId, command.source, at, emit);
      break;
    case 'give_action':
      applyGiveAction(next, command, at, emit);
      break;
    case 'resolve_action':
      applyResolveAction(next, command, at, emit);
      break;
    case 'record_uncertainty':
      addUncertainty(next.state, command.field, command.reason, command.source, at, emit);
      break;
    case 'escalate':
      applyEscalate(next, command.to, command.reason, command.source, at, emit);
      break;
    case 'close':
      applyClose(next, command.source, at, emit);
      break;
    case 'abandon':
      applyAbandon(next, command.source, at, emit);
      break;
    case 'recover':
      applyRecover(next, command.source, at, emit);
      break;
    case 'mark_handed_off':
      applyHandedOff(next, command.source, at, emit);
      break;
  }

  if (events.length > 0) {
    next.state.updatedAt = at;
    next.updatedAt = at;
  }

  return { incident: next, events };
}

function assertMutable(incident: Incident, command: IncidentCommand): void {
  if (command.kind === 'recover') return;

  if (incident.status === IncidentStatus.CLOSED) {
    throw new InvalidStateTransitionError('A closed incident cannot change');
  }

  if (incident.status === IncidentStatus.ABANDONED && command.kind !== 'close') {
    throw new InvalidStateTransitionError('An abandoned incident must be recovered before it can change');
  }

  if (incident.status === IncidentStatus.HANDED_OFF && command.kind !== 'close') {
    throw new InvalidStateTransitionError('A handed-off incident can only be closed');
  }
}

function applyEmergencyType(
  state: EmergencyState,
  emergencyType: EmergencyType,
  confidence: number,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (!isValueOf(EmergencyType, emergencyType)) {
    throw new ValidationError('emergencyType is not a recognised value', [
      { path: 'emergencyType', message: 'unrecognised emergency type' },
    ]);
  }
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new ValidationError('emergencyTypeConfidence must be between 0 and 1', [
      { path: 'emergencyTypeConfidence', message: 'must be between 0 and 1' },
    ]);
  }

  const previous = state.emergencyType;
  const nextType = emergencyType === EmergencyType.UNKNOWN ? EmergencyType.UNKNOWN : emergencyType;
  const nextConfidence = nextType === EmergencyType.UNKNOWN ? 0 : confidence;

  if (isContradiction(previous, nextType, EmergencyType.UNKNOWN)) {
    recordContradiction(state, 'emergencyType', previous, nextType, EmergencyType.UNKNOWN, source, at, emit);
    state.emergencyTypeConfidence = 0;
    return;
  }

  if (previous === nextType && state.emergencyTypeConfidence === nextConfidence) return;

  state.emergencyType = nextType;
  state.emergencyTypeConfidence = nextConfidence;
  emitStateChanged(emit, source, 'emergencyType', previous, nextType, 'Emergency type updated');
}

function applyLocation(
  state: EmergencyState,
  location: EmergencyState['location'],
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (location === null) {
    throw new ValidationError('location is required', [{ path: 'location', message: 'required' }]);
  }
  const previous = state.location;
  state.location = location;
  emitStateChanged(emit, source, 'location', previous, location, 'Location updated');
  void at;
}

function applyPeopleAffected(
  state: EmergencyState,
  peopleAffected: number | null,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (peopleAffected !== null && (!Number.isInteger(peopleAffected) || peopleAffected < 1)) {
    throw new ValidationError('peopleAffected must be a positive integer or null', [
      { path: 'peopleAffected', message: 'must be a positive integer or null' },
    ]);
  }

  const previous = state.peopleAffected;
  if (previous !== null && peopleAffected !== null && previous !== peopleAffected) {
    recordContradiction(state, 'peopleAffected', previous, peopleAffected, null, source, at, emit);
    return;
  }
  if (previous === peopleAffected) return;

  state.peopleAffected = peopleAffected;
  emitStateChanged(emit, source, 'peopleAffected', previous, peopleAffected, 'People affected updated');
}

function applyPatientFact(
  state: EmergencyState,
  field: 'ageGroup' | 'consciousness' | 'breathing',
  value: string,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (!PATIENT_ENUMS[field].has(value)) {
    throw new ValidationError(`${field} is not a recognised value`, [
      { path: `patient.${field}`, message: 'unrecognised value' },
    ]);
  }

  const path = `patient.${field}` as StructuredField;
  const previous = state.patient[field];
  const unknown = unknownSentinel(path);

  if (isContradiction(previous, value, unknown)) {
    recordContradiction(state, path, previous, value, unknown, source, at, emit);
    return;
  }
  if (previous === value) return;

  state.patient[field] = value as never;
  emitStateChanged(emit, source, path, previous, value, `${field} updated`);
}

function applyListAdd(
  state: EmergencyState,
  list: 'majorSymptoms' | 'relevantObservations',
  raw: string,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  const value = raw.trim();
  if (!value) {
    throw new ValidationError(`${list} entry is required`, [{ path: list, message: 'required' }]);
  }
  const exists = state.patient[list].some((item) => item.toLowerCase() === value.toLowerCase());
  if (exists) return;

  state.patient[list] = [...state.patient[list], value];
  const field = list === 'majorSymptoms' ? 'patient.majorSymptoms' : 'patient.relevantObservations';
  emitStateChanged(emit, source, field, null, value, `${list} updated`);
  void at;
}

function applyAnswer(
  state: EmergencyState,
  command: Extract<IncidentCommand, { kind: 'record_answer' }>,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  const question = command.question.trim();
  const answer = command.answer.trim();
  if (!question) {
    throw new ValidationError('question is required', [{ path: 'question', message: 'required' }]);
  }
  if (!answer) {
    throw new ValidationError('answer is required', [{ path: 'answer', message: 'required' }]);
  }
  if (!isValueOf(Certainty, command.certainty)) {
    throw new ValidationError('certainty is not a recognised value', [
      { path: 'certainty', message: 'unrecognised value' },
    ]);
  }

  const prior = lastAnswerForQuestion(state.relevantAnswers, command.questionId, question);
  const changed = prior !== undefined && normalize(prior.answer) !== normalize(answer);
  const certainty = changed ? Certainty.UNCERTAIN : command.certainty;

  const recorded: RecordedAnswer = {
    questionId: command.questionId,
    question,
    answer,
    certainty,
    source: command.source,
    recordedAt: at,
  };
  state.relevantAnswers = [...state.relevantAnswers, recorded];

  emit({
    type: IncidentEventType.ANSWER_RECORDED,
    source: command.source,
    summary: changed ? 'Answer changed' : 'Answer recorded',
    payload: {
      questionId: command.questionId,
      question,
      answer,
      certainty,
      previousAnswer: prior?.answer ?? null,
      changed,
    },
  });

  if (changed) {
    const field = command.updatesField ?? answerField(command.questionId, question);
    addUncertainty(
      state,
      field,
      `User changed the answer to "${question}" from "${prior.answer}" to "${answer}"`,
      command.source,
      at,
      emit,
    );
  }

  if (command.updatesField !== undefined && command.updatesValue !== undefined) {
    applyStructuredUpdate(state, command.updatesField, command.updatesValue, command.source, at, emit);
  }
}

function applyStructuredUpdate(
  state: EmergencyState,
  field: StructuredField,
  value: string | number,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  switch (field) {
    case 'emergencyType':
      applyEmergencyType(state, value as EmergencyType, 0.8, source, at, emit);
      return;
    case 'peopleAffected':
      applyPeopleAffected(state, typeof value === 'number' ? value : Number(value), source, at, emit);
      return;
    case 'patient.ageGroup':
      applyPatientFact(state, 'ageGroup', String(value), source, at, emit);
      return;
    case 'patient.consciousness':
      applyPatientFact(state, 'consciousness', String(value), source, at, emit);
      return;
    case 'patient.breathing':
      applyPatientFact(state, 'breathing', String(value), source, at, emit);
      return;
  }
}

function applySelectProtocol(
  state: EmergencyState,
  protocolId: Id,
  initialStepId: Id,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (!protocolId.trim() || !initialStepId.trim()) {
    throw new ValidationError('protocolId and initialStepId are required', [
      { path: 'protocolId', message: 'required' },
    ]);
  }
  if (state.currentProtocolId !== null && state.currentProtocolId !== protocolId) {
    throw new InvalidStateTransitionError('A different protocol is already selected for this incident', {
      currentProtocolId: state.currentProtocolId,
      requestedProtocolId: protocolId,
    });
  }
  if (state.currentProtocolId === protocolId && state.currentStepId === initialStepId) return;

  state.currentProtocolId = protocolId;
  if (state.currentStepId === null) {
    state.currentStepId = initialStepId;
  }

  emit({
    type: IncidentEventType.PROTOCOL_SELECTED,
    source,
    summary: 'Protocol selected',
    payload: { protocolId, initialStepId },
  });
  void at;
}

function applyCompleteStep(
  state: EmergencyState,
  stepId: Id,
  nextStepId: Id | null,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (state.currentProtocolId === null || state.currentStepId === null) {
    throw new InvalidStateTransitionError('No protocol step is active');
  }
  if (state.currentStepId !== stepId) {
    throw new InvalidStateTransitionError('Only the current protocol step can be completed', {
      currentStepId: state.currentStepId,
      requestedStepId: stepId,
    });
  }
  if (state.completedStepIds.includes(stepId)) {
    throw new InvalidStateTransitionError('This protocol step is already completed', { stepId });
  }

  const previous = state.currentStepId;
  state.completedStepIds = [...state.completedStepIds, stepId];
  state.currentStepId = nextStepId;

  emit({
    type: IncidentEventType.PROTOCOL_STEP_CHANGED,
    source,
    summary: nextStepId ? 'Protocol step advanced' : 'Protocol step completed; protocol finished',
    payload: { fromStepId: previous, toStepId: nextStepId, completedStepId: stepId },
  });
  void at;
}

function applyGiveAction(
  incident: Incident,
  command: Extract<IncidentCommand, { kind: 'give_action' }>,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  const instruction = command.instruction.trim();
  if (!instruction) {
    throw new ValidationError('instruction is required', [{ path: 'instruction', message: 'required' }]);
  }

  const action: ActionRecord = {
    id: command.id ?? createId(),
    incidentId: incident.id,
    protocolId: command.protocolId,
    stepId: command.stepId,
    instruction,
    status: ActionStatus.GIVEN,
    givenAt: at,
    confirmedAt: null,
    note: null,
  };
  incident.state.actions = [...incident.state.actions, action];

  emit({
    type: IncidentEventType.ACTION_GIVEN,
    source: command.source,
    summary: 'Action given',
    payload: { actionId: action.id, instruction, stepId: command.stepId },
  });
}

function applyResolveAction(
  incident: Incident,
  command: Extract<IncidentCommand, { kind: 'resolve_action' }>,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  const index = incident.state.actions.findIndex((action) => action.id === command.actionId);
  if (index === -1) {
    throw new InvalidStateTransitionError('Unknown action', { actionId: command.actionId });
  }

  const current = incident.state.actions[index];
  if (current.status !== ActionStatus.GIVEN) {
    throw new InvalidStateTransitionError('Only a given action can be resolved', {
      actionId: current.id,
      status: current.status,
    });
  }

  const resolved: ActionRecord = {
    ...current,
    status: command.status,
    confirmedAt: command.status === ActionStatus.CONFIRMED ? at : current.confirmedAt,
    note: command.note,
  };
  incident.state.actions = incident.state.actions.map((action, i) => (i === index ? resolved : action));

  emit({
    type: IncidentEventType.ACTION_CONFIRMED,
    source: command.source,
    summary: `Action ${command.status}`,
    payload: { actionId: resolved.id, status: resolved.status, note: resolved.note },
  });
}

function applyEscalate(
  incident: Incident,
  to: EscalationState,
  reason: string,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (!isValueOf(EscalationState, to) || to === EscalationState.NONE) {
    throw new ValidationError('escalation target is invalid', [{ path: 'to', message: 'must raise escalation' }]);
  }
  if (!reason.trim()) {
    throw new ValidationError('escalation reason is required', [{ path: 'reason', message: 'required' }]);
  }

  const from = incident.state.escalationStatus;
  if (ESCALATION_RANK[to] <= ESCALATION_RANK[from]) {
    throw new InvalidStateTransitionError('Escalation cannot move backwards', { from, to });
  }

  incident.state.escalationStatus = to;
  if (to === EscalationState.ESCALATED) {
    incident.status = IncidentStatus.ESCALATED;
  }

  emit({
    type: IncidentEventType.ESCALATION_TRIGGERED,
    source,
    summary: `Escalation ${to}`,
    payload: { from, to, reason: reason.trim() },
  });
  void at;
}

function applyClose(
  incident: Incident,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (incident.status === IncidentStatus.CLOSED) {
    throw new InvalidStateTransitionError('Incident is already closed');
  }
  const previous = incident.status;
  incident.status = IncidentStatus.CLOSED;
  incident.closedAt = at;
  emit({
    type: IncidentEventType.INCIDENT_CLOSED,
    source,
    summary: 'Incident closed',
    payload: { from: previous, to: IncidentStatus.CLOSED },
  });
}

function applyAbandon(
  incident: Incident,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (incident.status !== IncidentStatus.ACTIVE) {
    throw new InvalidStateTransitionError('Only an active incident can be abandoned', {
      status: incident.status,
    });
  }
  incident.status = IncidentStatus.ABANDONED;
  incident.closedAt = at;
  emitStateChanged(emit, source, 'status', IncidentStatus.ACTIVE, IncidentStatus.ABANDONED, 'Incident abandoned');
}

function applyRecover(
  incident: Incident,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (incident.status !== IncidentStatus.ABANDONED) {
    throw new InvalidStateTransitionError('Only an abandoned incident can be recovered', {
      status: incident.status,
    });
  }
  incident.status = IncidentStatus.ACTIVE;
  incident.closedAt = null;
  emitStateChanged(emit, source, 'status', IncidentStatus.ABANDONED, IncidentStatus.ACTIVE, 'Incident recovered');
  void at;
}

function applyHandedOff(
  incident: Incident,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  if (incident.status !== IncidentStatus.ACTIVE && incident.status !== IncidentStatus.ESCALATED) {
    throw new InvalidStateTransitionError('Only an active or escalated incident can be handed off', {
      status: incident.status,
    });
  }
  const previous = incident.status;
  incident.status = IncidentStatus.HANDED_OFF;
  emit({
    type: IncidentEventType.HANDOFF_GENERATED,
    source,
    summary: 'Incident handed off',
    payload: { from: previous, to: IncidentStatus.HANDED_OFF },
  });
  void at;
}

function recordContradiction(
  state: EmergencyState,
  field: string,
  previous: unknown,
  requested: unknown,
  unknownValue: unknown,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  setStructuredField(state, field, unknownValue);
  addUncertainty(
    state,
    field,
    `Contradictory values "${String(previous)}" and "${String(requested)}"; fact moved to unknown`,
    source,
    at,
    emit,
  );
  emitStateChanged(emit, source, field, previous, unknownValue, `${field} marked unknown after contradiction`);
}

function addUncertainty(
  state: EmergencyState,
  field: string,
  reason: string,
  source: EventSource,
  at: IsoDateTime,
  emit: (event: EngineEvent) => void,
): void {
  const trimmed = reason.trim();
  if (!field.trim() || !trimmed) {
    throw new ValidationError('uncertainty field and reason are required', [
      { path: 'field', message: 'required' },
    ]);
  }
  if (state.uncertainty.some((note) => note.field === field && note.reason === trimmed)) return;

  const note: UncertaintyNote = { field, reason: trimmed, source, recordedAt: at };
  state.uncertainty = [...state.uncertainty, note];
  emit({
    type: IncidentEventType.UNCERTAINTY_RECORDED,
    source,
    summary: 'Uncertainty recorded',
    payload: { field, reason: trimmed },
  });
}

function emitStateChanged(
  emit: (event: EngineEvent) => void,
  source: EventSource,
  field: string,
  previous: unknown,
  next: unknown,
  summary: string,
): void {
  emit({
    type: IncidentEventType.STATE_CHANGED,
    source,
    summary,
    payload: { field, previous, next },
  });
}

function lastAnswerForQuestion(
  answers: RecordedAnswer[],
  questionId: Id | null,
  question: string,
): RecordedAnswer | undefined {
  const matches = answers.filter((item) =>
    questionId ? item.questionId === questionId : item.question === question,
  );
  return matches.at(-1);
}

function answerField(questionId: Id | null, question: string): string {
  return questionId ? `answers.${questionId}` : `answers.${normalize(question)}`;
}

function isContradiction(previous: unknown, next: unknown, unknownValue: unknown): boolean {
  return previous !== unknownValue && next !== unknownValue && previous !== next;
}

function unknownSentinel(field: StructuredField): unknown {
  switch (field) {
    case 'emergencyType':
      return EmergencyType.UNKNOWN;
    case 'peopleAffected':
      return null;
    case 'patient.ageGroup':
      return AgeGroup.UNKNOWN;
    case 'patient.consciousness':
      return ConsciousnessState.UNKNOWN;
    case 'patient.breathing':
      return BreathingState.UNKNOWN;
  }
}

function setStructuredField(state: EmergencyState, field: string, value: unknown): void {
  switch (field) {
    case 'emergencyType':
      state.emergencyType = value as EmergencyType;
      return;
    case 'peopleAffected':
      state.peopleAffected = value as number | null;
      return;
    case 'patient.ageGroup':
      state.patient.ageGroup = value as AgeGroup;
      return;
    case 'patient.consciousness':
      state.patient.consciousness = value as ConsciousnessState;
      return;
    case 'patient.breathing':
      state.patient.breathing = value as BreathingState;
      return;
    default:
      throw new ValidationError(`Unsupported state field '${field}'`);
  }
}

function isValueOf<T extends Record<string, string>>(table: T, value: string): value is T[keyof T] {
  return Object.values(table).includes(value);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
