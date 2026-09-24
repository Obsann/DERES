import { useQuery } from '@tanstack/react-query';
import type { HealthResponse, Id, ListIncidentsQuery } from '@voicesos/shared';
import {
  getHealth,
  incidentsApi,
  protocolsApi,
  queryKeys,
} from '@/services/api';

export function useHealthQuery(enabled = true) {
  return useQuery<HealthResponse>({
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => getHealth({ signal }),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
  });
}

export function useIncidentQuery(incidentId: Id | null | undefined) {
  return useQuery({
    queryKey: queryKeys.incidents.detail(incidentId ?? 'unknown'),
    queryFn: ({ signal }) => incidentsApi.getById(incidentId as Id, { signal }),
    enabled: Boolean(incidentId),
  });
}

export function useIncidentTimelineQuery(incidentId: Id | null | undefined) {
  return useQuery({
    queryKey: queryKeys.incidents.timeline(incidentId ?? 'unknown'),
    queryFn: ({ signal }) => incidentsApi.getTimeline(incidentId as Id, { signal }),
    enabled: Boolean(incidentId),
  });
}

export function useIncidentHandoffQuery(incidentId: Id | null | undefined) {
  return useQuery({
    queryKey: queryKeys.incidents.handoff(incidentId ?? 'unknown'),
    queryFn: ({ signal }) => incidentsApi.getHandoff(incidentId as Id, { signal }),
    enabled: Boolean(incidentId),
  });
}

export function useIncidentsListQuery(query: ListIncidentsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.incidents.all(query),
    queryFn: ({ signal }) => incidentsApi.list(query, { signal }),
  });
}

export function useResponderIncidentsQuery(query: ListIncidentsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.incidents.responderAll(query),
    queryFn: ({ signal }) => incidentsApi.listForResponder(query, { signal }),
  });
}

export function useProtocolsQuery() {
  return useQuery({
    queryKey: queryKeys.protocols.all,
    queryFn: ({ signal }) => protocolsApi.list({ signal }),
  });
}
