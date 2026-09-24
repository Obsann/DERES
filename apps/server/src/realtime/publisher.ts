import type { IncidentSocketEvent } from '@voicesos/shared';
import type { SocketPayloadMap } from './payloads.js';

/**
 * Where a real-time event is sent. The Socket.IO implementation writes to
 * rooms; tests record the same calls without opening a port.
 */
export interface IncidentRealtime {
  emit<E extends IncidentSocketEvent>(
    event: E,
    rooms: readonly string[],
    payload: SocketPayloadMap[E],
  ): void;
}

const noopPublisher: IncidentRealtime = {
  emit() {
    // HTTP tests and persist unit tests run without a socket server.
  },
};

let current: IncidentRealtime = noopPublisher;

export function setIncidentRealtime(publisher: IncidentRealtime): void {
  current = publisher;
}

export function getIncidentRealtime(): IncidentRealtime {
  return current;
}

export function resetIncidentRealtime(): void {
  current = noopPublisher;
}

export interface RecordedRealtimeCall {
  event: IncidentSocketEvent;
  rooms: string[];
  payload: unknown;
}

/** In-memory sink so emit mapping can be tested without Socket.IO. */
export function createRecordingPublisher(): {
  publisher: IncidentRealtime;
  calls: RecordedRealtimeCall[];
} {
  const calls: RecordedRealtimeCall[] = [];
  return {
    calls,
    publisher: {
      emit(event, rooms, payload) {
        calls.push({ event, rooms: [...rooms], payload });
      },
    },
  };
}
