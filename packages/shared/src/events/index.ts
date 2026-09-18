import type { Id, IsoDateTime } from '../types/common.js';
import type { EmergencyState, ActionRecord, Incident, IncidentEvent } from '../types/incident.js';
import type { ConversationMessage } from '../types/conversation.js';
import type { Handoff } from '../types/handoff.js';
import type { IncidentStatus } from '../enums/index.js';

/**
 * Real-time event names (task.md Phase 10, git-workflow.md section 32).
 *
 * These strings are a contract between the server and the dashboard. Renaming
 * one silently breaks the other side, so treat a change here the same way as
 * an API change.
 */
export const IncidentSocketEvent = {
  CREATED: 'incident.created',
  UPDATED: 'incident.updated',
  STATE_CHANGED: 'incident.state_changed',
  MESSAGE_ADDED: 'incident.message_added',
  ACTION_RECORDED: 'incident.action_recorded',
  HANDOFF_UPDATED: 'incident.handoff_updated',
  CLOSED: 'incident.closed',
} as const;
export type IncidentSocketEvent =
  (typeof IncidentSocketEvent)[keyof typeof IncidentSocketEvent];

/** Fields every real-time payload carries. */
interface SocketEventEnvelope {
  incidentId: Id;
  emittedAt: IsoDateTime;
}

export interface IncidentCreatedPayload extends SocketEventEnvelope {
  incident: Incident;
}

export interface IncidentUpdatedPayload extends SocketEventEnvelope {
  incident: Incident;
}

export interface IncidentStateChangedPayload extends SocketEventEnvelope {
  state: EmergencyState;
  /** The timeline entry that caused the change. */
  event: IncidentEvent;
}

export interface IncidentMessageAddedPayload extends SocketEventEnvelope {
  message: ConversationMessage;
}

export interface IncidentActionRecordedPayload extends SocketEventEnvelope {
  action: ActionRecord;
}

export interface IncidentHandoffUpdatedPayload extends SocketEventEnvelope {
  handoff: Handoff;
}

export interface IncidentClosedPayload extends SocketEventEnvelope {
  status: IncidentStatus;
  closedAt: IsoDateTime;
}

/** Events the server emits. Use to type the Socket.IO client and server. */
export interface ServerToClientEvents {
  [IncidentSocketEvent.CREATED]: (payload: IncidentCreatedPayload) => void;
  [IncidentSocketEvent.UPDATED]: (payload: IncidentUpdatedPayload) => void;
  [IncidentSocketEvent.STATE_CHANGED]: (payload: IncidentStateChangedPayload) => void;
  [IncidentSocketEvent.MESSAGE_ADDED]: (payload: IncidentMessageAddedPayload) => void;
  [IncidentSocketEvent.ACTION_RECORDED]: (payload: IncidentActionRecordedPayload) => void;
  [IncidentSocketEvent.HANDOFF_UPDATED]: (payload: IncidentHandoffUpdatedPayload) => void;
  [IncidentSocketEvent.CLOSED]: (payload: IncidentClosedPayload) => void;
}

/** Events a client may send. */
export interface ClientToServerEvents {
  'incident.subscribe': (incidentId: Id) => void;
  'incident.unsubscribe': (incidentId: Id) => void;
}

/**
 * Room name for one incident. Both sides must derive the room from this
 * helper so a typo cannot silently drop every update for an incident.
 */
export function incidentRoom(incidentId: Id): string {
  return `incident:${incidentId}`;
}

/** Room every responder dashboard joins to receive new incidents. */
export const RESPONDER_ROOM = 'responders';
