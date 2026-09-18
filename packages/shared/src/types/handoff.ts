import type {
  Certainty,
  EmergencyType,
  EscalationState,
  IncidentStatus,
  WarningSeverity,
} from '../enums/index.js';
import type { Id, IncidentLocation, IsoDateTime, UncertaintyNote } from './common.js';
import type { ActionRecord, IncidentEvent, PatientState, RecordedAnswer } from './incident.js';

/**
 * One fact in the handoff, with how firmly it is established.
 *
 * The `certainty` field is what lets the responder UI separate "the patient is
 * not breathing" from "we could not establish whether the patient is
 * breathing". Never render a fact without it.
 */
export interface HandoffFact {
  label: string;
  value: string;
  certainty: Certainty;
  /** When this was established, so a responder can judge how stale it is. */
  establishedAt: IsoDateTime | null;
}

/** Something the responder needs to notice immediately. */
export interface HandoffWarning {
  severity: WarningSeverity;
  message: string;
}

/**
 * The structured summary handed to a professional responder.
 *
 * A handoff may only contain information the incident record supports. It must
 * never assert anything that was not actually established during the
 * conversation.
 */
export interface Handoff {
  id: Id;
  incidentId: Id;
  /** Increments each time the handoff is regenerated as the incident evolves. */
  version: number;
  emergencyType: EmergencyType;
  location: IncidentLocation | null;
  startedAt: IsoDateTime;
  peopleAffected: number | null;
  patient: PatientState;
  /** The few things a responder must read first. */
  criticalInformation: HandoffFact[];
  observedSymptoms: string[];
  questionsAnswered: RecordedAnswer[];
  actionsTaken: ActionRecord[];
  currentProtocolId: Id | null;
  currentProtocolName: string | null;
  currentStepLabel: string | null;
  status: IncidentStatus;
  escalationStatus: EscalationState;
  /** What was never established. Displayed, not hidden. */
  uncertainty: UncertaintyNote[];
  warnings: HandoffWarning[];
  timeline: IncidentEvent[];
  generatedAt: IsoDateTime;
}
