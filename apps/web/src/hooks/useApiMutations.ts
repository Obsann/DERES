import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AddMessageRequest,
  CreateIncidentRequest,
  Id,
  RecordActionRequest,
  UpdateIncidentRequest,
  VoiceTurnRequest,
} from '@voicesos/shared';
import { incidentsApi, queryKeys } from '@/services/api';

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
