import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client';
import {
  EventSource,
  IncidentEventType,
  IncidentSocketEvent,
  Language,
  UserRole,
} from '@voicesos/shared';
import { initialIncident } from '../database/initialState.js';
import { issueResponderToken } from '../security/tokens.js';
import { attachRealtime, closeRealtime, type IncidentIo } from './attach.js';
import { clearPublishDedupe, publishCreated, publishStateChanged } from './emit.js';
import { resetIncidentRealtime } from './publisher.js';

const AT = '2026-09-24T18:00:00.000Z';

const watched = initialIncident({
  id: 'incident-watch',
  sessionId: 'session-watch',
  language: Language.ENGLISH,
  at: AT,
});

function connectClient(port: number, token?: string): ClientSocket {
  return ioClient(`http://127.0.0.1:${port}`, {
    auth: token ? { token } : {},
    transports: ['websocket'],
    reconnection: false,
    forceNew: true,
  });
}

function onceConnected(socket: ClientSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('connect timed out')), 5_000);
    socket.once('connect', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once('connect_error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function onceEvent<T>(socket: ClientSocket, event: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for ${event}`)), 5_000);
    socket.once(event, (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

describe('realtime socket server', () => {
  let httpServer: HttpServer | undefined;
  let io: IncidentIo | undefined;
  let client: ClientSocket | undefined;

  async function listen(): Promise<number> {
    httpServer = createServer();
    io = attachRealtime(httpServer, {
      loadIncident: async (id) => {
        if (id !== watched.id) throw new Error('missing');
        return watched;
      },
    });
    await new Promise<void>((resolve) => {
      httpServer?.listen(0, '127.0.0.1', () => resolve());
    });
    const address = httpServer.address() as AddressInfo;
    return address.port;
  }

  afterEach(async () => {
    client?.removeAllListeners();
    client?.close();
    client = undefined;
    if (io) {
      await closeRealtime(io);
      io = undefined;
      httpServer = undefined;
    } else if (httpServer) {
      await new Promise<void>((resolve) => httpServer?.close(() => resolve()));
      httpServer = undefined;
    }
    resetIncidentRealtime();
    clearPublishDedupe();
  });

  it('rejects a handshake without a responder token', async () => {
    const port = await listen();
    client = connectClient(port);
    await expect(onceConnected(client)).rejects.toMatchObject({ message: 'Authentication required' });
  });

  it('rejects a forged token', async () => {
    const port = await listen();
    client = connectClient(port, 'forged.token');
    await expect(onceConnected(client)).rejects.toMatchObject({ message: 'Authentication required' });
  });

  it('delivers incident.created to a connected responder without a refresh', async () => {
    const port = await listen();
    const token = issueResponderToken('responder-1', UserRole.RESPONDER);
    client = connectClient(port, token);
    await onceConnected(client);

    const created = onceEvent<{ incidentId: string }>(client, IncidentSocketEvent.CREATED);
    publishCreated(watched);
    const payload = await created;

    expect(payload.incidentId).toBe(watched.id);
  });

  it('joins an incident room on subscribe and then receives state changes', async () => {
    const port = await listen();
    const token = issueResponderToken('responder-2', UserRole.RESPONDER);
    client = connectClient(port, token);
    await onceConnected(client);

    const snapshot = onceEvent<{ incident: { id: string } }>(client, IncidentSocketEvent.UPDATED);
    client.emit('incident.subscribe', watched.id);
    const current = await snapshot;
    expect(current.incident.id).toBe(watched.id);

    const changed = onceEvent<{ event: { id: string } }>(client, IncidentSocketEvent.STATE_CHANGED);
    publishStateChanged(watched, {
      id: 'event-state',
      incidentId: watched.id,
      sequence: 2,
      type: IncidentEventType.STATE_CHANGED,
      source: EventSource.USER,
      summary: 'Location updated',
      payload: { field: 'location' },
      occurredAt: AT,
    });
    const live = await changed;
    expect(live.event.id).toBe('event-state');
  });

  it('stops receiving incident events after unsubscribe', async () => {
    const port = await listen();
    const token = issueResponderToken('responder-3', UserRole.RESPONDER);
    client = connectClient(port, token);
    await onceConnected(client);

    const snapshot = onceEvent(client, IncidentSocketEvent.UPDATED);
    client.emit('incident.subscribe', watched.id);
    await snapshot;
    client.emit('incident.unsubscribe', watched.id);
    await new Promise((resolve) => setTimeout(resolve, 50));

    let received = false;
    client.on(IncidentSocketEvent.STATE_CHANGED, () => {
      received = true;
    });
    publishStateChanged(watched, {
      id: 'event-after-leave',
      incidentId: watched.id,
      sequence: 3,
      type: IncidentEventType.STATE_CHANGED,
      source: EventSource.SYSTEM,
      summary: 'Should not arrive',
      payload: null,
      occurredAt: AT,
    });
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(received).toBe(false);
  });
});
