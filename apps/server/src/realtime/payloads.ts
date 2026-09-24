import {
  IncidentSocketEvent,
  type IncidentActionRecordedPayload,
  type IncidentClosedPayload,
  type IncidentCreatedPayload,
  type IncidentHandoffUpdatedPayload,
  type IncidentMessageAddedPayload,
  type IncidentStateChangedPayload,
  type IncidentUpdatedPayload,
} from '@voicesos/shared';

/** Payload type for each server-to-client event name. */
export interface SocketPayloadMap {
  [IncidentSocketEvent.CREATED]: IncidentCreatedPayload;
  [IncidentSocketEvent.UPDATED]: IncidentUpdatedPayload;
  [IncidentSocketEvent.STATE_CHANGED]: IncidentStateChangedPayload;
  [IncidentSocketEvent.MESSAGE_ADDED]: IncidentMessageAddedPayload;
  [IncidentSocketEvent.ACTION_RECORDED]: IncidentActionRecordedPayload;
  [IncidentSocketEvent.HANDOFF_UPDATED]: IncidentHandoffUpdatedPayload;
  [IncidentSocketEvent.CLOSED]: IncidentClosedPayload;
}
