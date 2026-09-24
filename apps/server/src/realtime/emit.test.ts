import { afterEach, describe, expect, it } from 'vitest';
import {
  ActionStatus,
  AgeGroup,
  BreathingState,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  IncidentEventType,
  IncidentSocketEvent,
  IncidentStatus,
  Language,
  MessageRole,
  RESPONDER_ROOM,
  incidentRoom,
} from '@voicesos/shared';
import { initialIncident } from '../database/initialState.js';
import {
  clearPublishDedupe,
  publishAction,
  publishClosed,
  publishCreated,
  publishHandoff,
  publishMessage,
  publishSnapshot,
  publishTimelineEvent,
  publishUpdated,
} from './emit.js';
import { createRecordingPublisher, resetIncidentRealtime, setIncidentRealtime } from './publisher.js';

const AT = '2026-09-24T18:00:00.000Z';

function sampleIncident() {
  return initialIncident({
    id: 'incident-rt-1',
    sessionId: 'session-rt-1',
    language: Language.ENGLISH,
    at: AT,
  });
}

afterEach(() => {
  resetIncidentRealtime();
  clearPublishDedupe();
});

describe('realtime emit mapping', () => {
  it('sends created and updated events to the responder list and the incident room', () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);
    const incident = sampleIncident();

    publishCreated(incident);
    publishUpdated(incident);

    expect(calls).toHaveLength(2);
    expect(calls[0]?.event).toBe(IncidentSocketEvent.CREATED);
    expect(calls[0]?.rooms).toEqual([RESPONDER_ROOM, incidentRoom(incident.id)]);
    expect(calls[1]?.event).toBe(IncidentSocketEvent.UPDATED);
    expect(calls[1]?.rooms).toEqual([RESPONDER_ROOM, incidentRoom(incident.id)]);
  });

  it('does not emit the same created or updated payload twice', () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);
    const incident = sampleIncident();

    publishCreated(incident);
    publishCreated(incident);
    publishUpdated(incident);
    publishUpdated(incident);

    expect(calls.map((call) => call.event)).toEqual([
      IncidentSocketEvent.CREATED,
      IncidentSocketEvent.UPDATED,
    ]);
  });

  it('keeps state, message, action and handoff events on the incident room', () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);
    const incident = sampleIncident();
    const event = {
      id: 'event-1',
      incidentId: incident.id,
      sequence: 2,
      type: IncidentEventType.STATE_CHANGED,
      source: EventSource.USER,
      summary: 'Language updated',
      payload: { field: 'language' },
      occurredAt: AT,
    };

    publishTimelineEvent(incident, event);
    publishMessage({
      id: 'msg-1',
      incidentId: incident.id,
      role: MessageRole.USER,
      transcript: 'He collapsed',
      language: Language.ENGLISH,
      recognitionConfidence: 0.9,
      createdAt: AT,
    });
    publishAction(incident.id, {
      id: 'action-1',
      incidentId: incident.id,
      protocolId: 'protocol-unconscious-adult',
      stepId: 'step-call-ems',
      instruction: 'Call emergency services now.',
      status: ActionStatus.CONFIRMED,
      givenAt: AT,
      confirmedAt: AT,
      note: null,
    });
    publishHandoff({
      id: 'handoff-1',
      incidentId: incident.id,
      version: 1,
      emergencyType: EmergencyType.UNKNOWN,
      location: null,
      startedAt: AT,
      peopleAffected: null,
      patient: {
        ageGroup: AgeGroup.UNKNOWN,
        consciousness: ConsciousnessState.UNKNOWN,
        breathing: BreathingState.UNKNOWN,
        majorSymptoms: [],
        relevantObservations: [],
      },
      criticalInformation: [],
      observedSymptoms: [],
      questionsAnswered: [],
      actionsTaken: [],
      currentProtocolId: null,
      currentProtocolName: null,
      currentStepLabel: null,
      status: IncidentStatus.ACTIVE,
      escalationStatus: EscalationState.NONE,
      uncertainty: [],
      warnings: [],
      timeline: [],
      generatedAt: AT,
    });

    expect(calls.map((call) => call.event)).toEqual([
      IncidentSocketEvent.STATE_CHANGED,
      IncidentSocketEvent.MESSAGE_ADDED,
      IncidentSocketEvent.ACTION_RECORDED,
      IncidentSocketEvent.HANDOFF_UPDATED,
    ]);
    for (const call of calls) {
      expect(call.rooms).toEqual([incidentRoom(incident.id)]);
    }
  });

  it('broadcasts a close to the list when a snapshot ends the incident', () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);
    const incident = {
      ...sampleIncident(),
      status: IncidentStatus.CLOSED,
      closedAt: AT,
      updatedAt: AT,
    };

    publishSnapshot(incident);

    expect(calls.map((call) => call.event)).toEqual([
      IncidentSocketEvent.UPDATED,
      IncidentSocketEvent.CLOSED,
    ]);
    expect(calls[1]?.rooms).toEqual([RESPONDER_ROOM, incidentRoom(incident.id)]);
    expect(calls[1]?.payload).toMatchObject({
      incidentId: incident.id,
      status: IncidentStatus.CLOSED,
      closedAt: AT,
    });
  });

  it('maps action timeline rows onto action.recorded using the snapshot', () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);
    const incident = sampleIncident();
    const action = {
      id: 'action-2',
      incidentId: incident.id,
      protocolId: null,
      stepId: null,
      instruction: 'Stay with them.',
      status: ActionStatus.GIVEN,
      givenAt: AT,
      confirmedAt: null,
      note: null,
    };
    incident.state.actions = [action];

    publishTimelineEvent(incident, {
      id: 'event-action',
      incidentId: incident.id,
      sequence: 3,
      type: IncidentEventType.ACTION_GIVEN,
      source: EventSource.PROTOCOL,
      summary: 'Action given',
      payload: { actionId: action.id },
      occurredAt: AT,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.event).toBe(IncidentSocketEvent.ACTION_RECORDED);
    expect(calls[0]?.payload).toMatchObject({ action });
  });

  it('does not treat a message timeline row as a state change', () => {
    const { publisher, calls } = createRecordingPublisher();
    setIncidentRealtime(publisher);

    publishTimelineEvent(sampleIncident(), {
      id: 'event-msg',
      incidentId: 'incident-rt-1',
      sequence: 2,
      type: IncidentEventType.MESSAGE_ADDED,
      source: EventSource.USER,
      summary: 'Message recorded',
      payload: { messageId: 'msg-1' },
      occurredAt: AT,
    });

    expect(calls).toEqual([]);
  });

  it('swallows a publisher throw so a persist write still succeeds', () => {
    setIncidentRealtime({
      emit() {
        throw new Error('socket down');
      },
    });

    expect(() => publishClosed(sampleIncident())).not.toThrow();
  });
});
