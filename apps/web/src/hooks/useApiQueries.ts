import { useQuery, useQueryClient } from '@tanstack/react-query';
import { publishedProtocols } from '@voicesos/protocols';
import type { HealthResponse, Id, Incident, ListIncidentsQuery } from '@voicesos/shared';
import {
  getHealth,
  incidentsApi,
  isApiClientError,
  protocolsApi,
  queryKeys,
} from '@/services/api';
import { isLocalIncidentId } from '@/services/protocol/localIncident';

export function useHealthQuery(enabled = true) {
  return useQuery<HealthResponse>({
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => getHealth({ signal }),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
  });
}

export function useIncidentQuery(incidentId: Id | null | undefined) {
  const queryClient = useQueryClient();
  const local = isLocalIncidentId(incidentId);
  return useQuery({
    queryKey: queryKeys.incidents.detail(incidentId ?? 'unknown'),
    queryFn: ({ signal }) => {
      if (local) {
        const cached = queryClient.getQueryData<Incident>(queryKeys.incidents.detail(incidentId as Id));
        if (!cached) throw new Error('Local incident is gone. Start again.');
        return Promise.resolve(cached);
      }
      return incidentsApi.getById(incidentId as Id, { signal });
    },
    enabled: Boolean(incidentId),
    staleTime: local ? Infinity : undefined,
    refetchOnMount: local ? false : undefined,
    refetchOnReconnect: local ? false : undefined,
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
    queryFn: async ({ signal }) => {
      try {
        return await protocolsApi.list({ signal });
      } catch (error) {
        if (isApiClientError(error) && error.isRetryable) return publishedProtocols;
        throw error;
      }
    },
    placeholderData: publishedProtocols,
  });
}
