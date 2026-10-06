import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyButtonGuide, publishedProtocols, toLocalVoiceTurn } from '@voicesos/protocols';
import type {
  AddMessageRequest,
  ButtonTurnRequest,
  CreateIncidentRequest,
  Id,
  Incident,
  Protocol,
  RecordActionRequest,
  UpdateIncidentRequest,
  VoiceTurnRequest,
} from '@voicesos/shared';
import { incidentsApi, isApiClientError, queryKeys } from '@/services/api';
import { isLocalIncidentId } from '@/services/protocol/localIncident';

export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateIncidentRequest) => incidentsApi.create(body),
    onSuccess: (incident) => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.setQueryData(queryKeys.incidents.detail(incident.id), incident);
    },
  });
}

export function useUpdateIncidentMutation(incidentId: Id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateIncidentRequest) =>
      incidentsApi.update(incidentId, body),
    onSuccess: (incident) => {
      queryClient.setQueryData(queryKeys.incidents.detail(incident.id), incident);
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useAddMessageMutation(incidentId: Id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddMessageRequest) =>
      incidentsApi.addMessage(incidentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.timeline(incidentId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.detail(incidentId),
      });
    },
  });
}

export function useRecordActionMutation(incidentId: Id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordActionRequest) =>
      incidentsApi.recordAction(incidentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.detail(incidentId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.timeline(incidentId),
      });
    },
  });
}

export function useVoiceTurnMutation(incidentId: Id) {
  return useMutation({
    mutationFn: (body?: VoiceTurnRequest) =>
      incidentsApi.voiceTurn(incidentId, body ?? {}),
  });
}

export function useButtonTurnMutation(incidentId: Id | null) {
  const queryClient = useQueryClient();

  function applyLocally(body: ButtonTurnRequest) {
    if (!incidentId) throw new Error('No incident');
    const current = queryClient.getQueryData<Incident>(queryKeys.incidents.detail(incidentId));
    if (!current) throw new Error('Incident is not loaded');
    const protocols = queryClient.getQueryData<Protocol[]>(queryKeys.protocols.all) ?? publishedProtocols;
    const turn = applyButtonGuide(current, body, protocols);
    queryClient.setQueryData(queryKeys.incidents.detail(incidentId), turn.incident);
    return { ...toLocalVoiceTurn(turn.incident, turn), local: true as const };
  }

  return useMutation({
    mutationFn: async (body: ButtonTurnRequest) => {
      if (!incidentId) throw new Error('No incident');
      if (isLocalIncidentId(incidentId) || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        return applyLocally(body);
      }
      try {
        const turn = await incidentsApi.buttonTurn(incidentId, body);
        return { ...turn, local: false as const };
      } catch (error) {
        if (isApiClientError(error) && (error.isNetworkError || error.status >= 500)) {
          return applyLocally(body);
        }
        throw error;
      }
    },
    onSuccess: (turn) => {
      if (!incidentId || turn.local) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) });
    },
  });
}
