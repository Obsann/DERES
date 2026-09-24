import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import {
  IncidentSocketEvent,
  RESPONDER_ROOM,
  incidentRoom,
  type ClientToServerEvents,
  type Id,
  type Incident,
  type ServerToClientEvents,
  type UserRole,
} from '@voicesos/shared';
import { config } from '../common/config.js';
import { UnauthorizedError } from '../common/errors.js';
import { logger } from '../common/logger.js';
import { isDatabaseConnected } from '../database/connection.js';
import { getIncidentById, getUserById } from '../database/persist.js';
import { verifyResponderToken } from '../security/tokens.js';
import { nowIso } from '../database/ids.js';
import { resetIncidentRealtime, setIncidentRealtime } from './publisher.js';

export interface SocketData {
  userId: Id;
  role: UserRole;
}

export type IncidentSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export type IncidentIo = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export interface AttachRealtimeOptions {
  /**
   * Override incident lookup so socket tests can subscribe without MongoDB.
   * Production uses {@link getIncidentById}.
   */
  loadIncident?: (incidentId: Id) => Promise<Incident>;
}

function readHandshakeToken(socket: IncidentSocket): string | null {
  const fromAuth = socket.handshake.auth['token'];
  if (typeof fromAuth === 'string' && fromAuth.trim() !== '') {
    return fromAuth.trim();
  }
  const header = socket.handshake.headers.authorization;
  if (typeof header !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() ?? null;
}

function isIncidentId(value: unknown): value is Id {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}

async function authenticateSocket(socket: IncidentSocket): Promise<void> {
  const token = readHandshakeToken(socket);
  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  const payload = verifyResponderToken(token);

  if (isDatabaseConnected()) {
    const user = await getUserById(payload.sub);
    if (user.role !== payload.role) {
      throw new UnauthorizedError('Authentication required');
    }
  }

  socket.data.userId = payload.sub;
  socket.data.role = payload.role;
}

/**
 * Attach Socket.IO to the HTTP server.
 *
 * Handshake requires a responder token (same HMAC as Task 12). Every
 * authenticated socket joins the responder room so a new incident appears
 * on the list. Detail events go to `incident:{id}` after subscribe.
 */
export function attachRealtime(httpServer: HttpServer, options: AttachRealtimeOptions = {}): IncidentIo {
  const loadIncident = options.loadIncident ?? getIncidentById;

  const io: IncidentIo = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
    // A dropped dashboard reconnects without a full handshake for two minutes.
    connectionStateRecovery: {
      maxDisconnectionDuration: 120_000,
    },
  });

  io.use((socket, next) => {
    void authenticateSocket(socket)
      .then(() => next())
      .catch((error: unknown) => {
        next(error instanceof Error ? error : new UnauthorizedError('Authentication required'));
      });
  });

  io.on('connection', (socket) => {
    void socket.join(RESPONDER_ROOM);
    logger.info('realtime connected', { userId: socket.data.userId });

    socket.on('incident.subscribe', (incidentId) => {
      void subscribeToIncident(socket, incidentId, loadIncident);
    });

    socket.on('incident.unsubscribe', (incidentId) => {
      if (!isIncidentId(incidentId)) return;
      void socket.leave(incidentRoom(incidentId));
    });

    socket.on('disconnect', (reason) => {
      logger.debug('realtime disconnected', { userId: socket.data.userId, reason });
    });
  });

  setIncidentRealtime({
    emit(event, rooms, payload) {
      // Socket.IO cannot narrow a generic event name to ServerToClientEvents.
      const emit = (
        rooms.length === 0 ? io : io.to([...rooms])
      ) as { emit: (name: typeof event, data: typeof payload) => void };
      emit.emit(event, payload);
    },
  });

  return io;
}

async function subscribeToIncident(
  socket: IncidentSocket,
  incidentId: unknown,
  loadIncident: (id: Id) => Promise<Incident>,
): Promise<void> {
  if (!isIncidentId(incidentId)) return;

  try {
    const incident = await loadIncident(incidentId);
    await socket.join(incidentRoom(incident.id));
    // Snapshot so a reconnect does not need a manual refresh (Task 13 verify).
    socket.emit(IncidentSocketEvent.UPDATED, {
      incidentId: incident.id,
      emittedAt: nowIso(),
      incident,
    });
  } catch {
    logger.debug('realtime subscribe ignored unknown incident', {
      userId: socket.data.userId,
      incidentId,
    });
  }
}

export function closeRealtime(io: IncidentIo): Promise<void> {
  resetIncidentRealtime();
  return new Promise((resolve, reject) => {
    io.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
