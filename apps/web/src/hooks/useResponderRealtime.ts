import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import {
  ConnectionStatus,
  IncidentSocketEvent,
  type ClientToServerEvents,
  type Id,
  type ServerToClientEvents,
} from '@voicesos/shared';
import { getApiBaseUrl, queryKeys } from '@/services/api';
import { responderSession } from '@/services/auth/responderToken';
import { useResponderUi } from '@/state';

type DeresSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Live dashboard sync (Task 24). Socket events only invalidate queries; the
 * REST endpoints stay the source of truth, so a missed event costs freshness,
 * never correctness.
 */
export function useResponderRealtime(incidentId?: Id) {
  const queryClient = useQueryClient();
  const { setConnection } = useResponderUi();
  const socketRef = useRef<DeresSocket | null>(null);
  const token = responderSession.token();

  useEffect(() => {
    if (!token) return;
    const socket: DeresSocket = io(getApiBaseUrl() || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    setConnection(ConnectionStatus.CONNECTING);

    const refreshLists = () => {
      void queryClient.invalidateQueries({ queryKey: ['responder', 'incidents'] });
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
    };
    const refreshIncident = ({ incidentId: id }: { incidentId: Id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.incidents.handoff(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.incidents.timeline(id) });
    };

    socket.on('connect', () => setConnection(ConnectionStatus.CONNECTED));
    socket.on('disconnect', () => setConnection(ConnectionStatus.RECONNECTING));
    socket.on('connect_error', () => setConnection(ConnectionStatus.DISCONNECTED));
    socket.io.on('reconnect_attempt', () => setConnection(ConnectionStatus.RECONNECTING));
    socket.on(IncidentSocketEvent.CREATED, refreshLists);
    socket.on(IncidentSocketEvent.UPDATED, (payload) => {
      refreshLists();
      refreshIncident(payload);
    });
    socket.on(IncidentSocketEvent.CLOSED, (payload) => {
      refreshLists();
      refreshIncident(payload);
    });
    socket.on(IncidentSocketEvent.STATE_CHANGED, refreshIncident);
    socket.on(IncidentSocketEvent.ACTION_RECORDED, refreshIncident);
    socket.on(IncidentSocketEvent.HANDOFF_UPDATED, refreshIncident);
    socket.on(IncidentSocketEvent.MESSAGE_ADDED, refreshIncident);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnection(ConnectionStatus.IDLE);
    };
  }, [token, queryClient, setConnection]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !incidentId) return;
    const subscribe = () => socket.emit('incident.subscribe', incidentId);
    if (socket.connected) subscribe();
    socket.on('connect', subscribe);
    return () => {
      socket.off('connect', subscribe);
      socket.emit('incident.unsubscribe', incidentId);
    };
  }, [incidentId, token]);
}
