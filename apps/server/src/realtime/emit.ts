import {
  IncidentEventType,
  IncidentSocketEvent,
  IncidentStatus,
  RESPONDER_ROOM,
  incidentRoom,
  type ActionRecord,
  type ConversationMessage,
  type Handoff,
  type Id,
  type Incident,
  type IncidentEvent,
} from '@voicesos/shared';
import { logger } from '../common/logger.js';
import { nowIso } from '../database/ids.js';
import type { SocketPayloadMap } from './payloads.js';
import { getIncidentRealtime } from './publisher.js';

/**
 * Timeline types that change what the dashboard shows as "current state".
 *
 * Message, action, and handoff documents have their own socket events so they
 * are not double-broadcast here.
 */
const STATE_EVENT_TYPES = new Set<IncidentEventType>([
  IncidentEventType.STATE_CHANGED,
  IncidentEventType.PROTOCOL_SELECTED,
  IncidentEventType.PROTOCOL_STEP_CHANGED,
  IncidentEventType.ANSWER_RECORDED,
  IncidentEventType.UNCERTAINTY_RECORDED,
  IncidentEventType.ESCALATION_TRIGGERED,
  IncidentEventType.SAFETY_BLOCK,
  IncidentEventType.QUESTION_ASKED,
  IncidentEventType.HANDOFF_GENERATED,
]);

const ACTION_EVENT_TYPES = new Set<IncidentEventType>([
  IncidentEventType.ACTION_GIVEN,
  IncidentEventType.ACTION_CONFIRMED,
]);

const TERMINAL_STATUS = new Set<IncidentStatus>([
  IncidentStatus.CLOSED,
  IncidentStatus.ABANDONED,
]);

/**
 * Recent emit keys. A reconnect or a double persist must not replay the same
 * socket event and make the dashboard flicker.
 */
const recentKeys = new Set<string>();
const RECENT_LIMIT = 400;

export function clearPublishDedupe(): void {
  recentKeys.clear();
}

function remember(key: string): boolean {
  if (recentKeys.has(key)) return false;
  recentKeys.add(key);
  if (recentKeys.size > RECENT_LIMIT) {
    const first = recentKeys.values().next().value;
    if (first !== undefined) recentKeys.delete(first);
  }
  return true;
}

function safeEmit<E extends IncidentSocketEvent>(
  event: E,
  rooms: readonly string[],
  payload: SocketPayloadMap[E],
): void {
  try {
    getIncidentRealtime().emit(event, rooms, payload);
  } catch (error) {
    logger.warn('realtime emit failed', {
      event,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function envelope(incidentId: Id): { incidentId: Id; emittedAt: string } {
  return { incidentId, emittedAt: nowIso() };
}

/** New incidents go to every dashboard and to that incident's room. */
export function publishCreated(incident: Incident): void {
  if (!remember(`created:${incident.id}`)) return;
  safeEmit(IncidentSocketEvent.CREATED, [RESPONDER_ROOM, incidentRoom(incident.id)], {
    ...envelope(incident.id),
    incident,
  });
}

/**
 * Snapshot writes. Dashboards on the list and anyone watching the incident
 * both need this so status and type stay current without a refresh.
 */
export function publishUpdated(incident: Incident): void {
  if (!remember(`updated:${incident.id}:${incident.updatedAt}`)) return;
  safeEmit(IncidentSocketEvent.UPDATED, [RESPONDER_ROOM, incidentRoom(incident.id)], {
    ...envelope(incident.id),
    incident,
  });
}

export function publishStateChanged(incident: Incident, event: IncidentEvent): void {
  if (!remember(`state:${event.id}`)) return;
  safeEmit(IncidentSocketEvent.STATE_CHANGED, [incidentRoom(incident.id)], {
    ...envelope(incident.id),
    state: incident.state,
    event,
  });
}

export function publishMessage(message: ConversationMessage): void {
  if (!remember(`message:${message.id}`)) return;
  safeEmit(IncidentSocketEvent.MESSAGE_ADDED, [incidentRoom(message.incidentId)], {
    ...envelope(message.incidentId),
    message,
  });
}

export function publishAction(incidentId: Id, action: ActionRecord): void {
  if (!remember(`action:${action.id}:${action.status}:${action.confirmedAt ?? ''}`)) return;
  safeEmit(IncidentSocketEvent.ACTION_RECORDED, [incidentRoom(incidentId)], {
    ...envelope(incidentId),
    action,
  });
}

export function publishHandoff(handoff: Handoff): void {
  if (!remember(`handoff:${handoff.id}:${handoff.version}`)) return;
  safeEmit(IncidentSocketEvent.HANDOFF_UPDATED, [incidentRoom(handoff.incidentId)], {
    ...envelope(handoff.incidentId),
    handoff,
  });
}

export function publishClosed(incident: Incident): void {
  const closedAt = incident.closedAt ?? incident.updatedAt;
  if (!remember(`closed:${incident.id}:${closedAt}`)) return;
  safeEmit(IncidentSocketEvent.CLOSED, [RESPONDER_ROOM, incidentRoom(incident.id)], {
    ...envelope(incident.id),
    status: incident.status,
    closedAt,
  });
}

/** After a snapshot write: list update, and a close event when the case ended. */
export function publishSnapshot(incident: Incident): void {
  publishUpdated(incident);
  if (TERMINAL_STATUS.has(incident.status)) {
    publishClosed(incident);
  }
}

function actionIdFrom(event: IncidentEvent): string | null {
  const payload = event.payload;
  if (payload === null || typeof payload !== 'object') return null;
  const value = payload['actionId'];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Map one persisted timeline row onto the socket events Melkamu's dashboard
 * already has names for. Created / message / handoff documents are published
 * from their own persist functions so they are not sent twice.
 */
export function publishTimelineEvent(incident: Incident, event: IncidentEvent): void {
  if (STATE_EVENT_TYPES.has(event.type)) {
    publishStateChanged(incident, event);
  }

  if (ACTION_EVENT_TYPES.has(event.type)) {
    const actionId = actionIdFrom(event);
    const action = actionId
      ? incident.state.actions.find((item) => item.id === actionId)
      : undefined;
    if (action) publishAction(incident.id, action);
  }

  if (event.type === IncidentEventType.INCIDENT_CLOSED) {
    publishClosed(incident);
  }
}
