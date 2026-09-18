import type {
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
  Language,
} from '../enums/index.js';
import type { Id, IncidentLocation, IsoDateTime, UncertaintyNote } from './common.js';

/** What is known about the affected person (specification section 14). */
export interface PatientState {
  ageGroup: AgeGroup;
  consciousness: ConsciousnessState;
  breathing: BreathingState;
  /** Symptoms the user reported, in the user's own words where practical. */
  majorSymptoms: string[];
  /** Anything else observed that does not fit a structured field. */
  relevantObservations: string[];
}

/** An answer the user gave to a protocol question. */
export interface RecordedAnswer {
  /** Protocol question this answers, or null for volunteered information. */
  questionId: Id | null;
  question: string;
  answer: string;
  certainty: Certainty;
  source: EventSource;
  recordedAt: IsoDateTime;
}

/**
 * One protocol-approved instruction and what happened to it.
 *
 * task.md Phase 4 tracks "actions given" and "actions confirmed" separately.
 * They are one list here with a {@link ActionStatus}; confirmed actions are
 * the entries whose status is `CONFIRMED`. Keeping a single record avoids two
 * lists drifting apart and losing the link between an instruction and its
 * confirmation.
 */
export interface ActionRecord {
  id: Id;
  incidentId: Id;
  protocolId: Id | null;
  stepId: Id | null;
  /** The instruction exactly as it was approved and delivered. */
  instruction: string;
  status: ActionStatus;
  givenAt: IsoDateTime;
  confirmedAt: IsoDateTime | null;
  /** For example why the user was unable to perform the action. */
  note: string | null;
}

/**
 * The structured picture of the emergency.
 *
 * This, not the conversation history, is what the protocol engine reads. The
 * LLM proposes changes to it; validation decides whether they are applied.
 */
export interface EmergencyState {
  emergencyType: EmergencyType;
  /** Confidence in `emergencyType`, from 0 to 1. */
  emergencyTypeConfidence: number;
  location: IncidentLocation | null;
  peopleAffected: number | null;
  patient: PatientState;
  relevantAnswers: RecordedAnswer[];
  currentProtocolId: Id | null;
  currentStepId: Id | null;
  completedStepIds: Id[];
  actions: ActionRecord[];
  escalationStatus: EscalationState;
  /** Everything the system knows it does not know. */
  uncertainty: UncertaintyNote[];
  updatedAt: IsoDateTime;
}

/** A single emergency, from the first utterance to responder handoff. */
export interface Incident {
  id: Id;
  /**
   * Null for the anonymous emergency flow. The MVP must not require an
   * account before someone can ask for help.
   */
  userId: Id | null;
  /** Ties an incident to a browser/voice session for reconnection. */
  sessionId: Id;
  language: Language;
  status: IncidentStatus;
  state: EmergencyState;
  startedAt: IsoDateTime;
  closedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/**
 * An append-only timeline entry.
 *
 * Incident events are never edited or deleted. The incident state can always
 * be reconstructed by replaying them in `sequence` order.
 */
export interface IncidentEvent {
  id: Id;
  incidentId: Id;
  /** Monotonic per incident, starting at 1. Defines timeline order. */
  sequence: number;
  type: IncidentEventType;
  source: EventSource;
  /** Short human-readable line for the responder timeline. */
  summary: string;
  /** Structured detail, shape depends on `type`. */
  payload: Record<string, unknown> | null;
  occurredAt: IsoDateTime;
}
