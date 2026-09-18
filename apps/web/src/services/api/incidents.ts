import type {
  AddMessageRequest,
  AddMessageResponse,
  CreateIncidentRequest,
  CreateIncidentResponse,
  GetHandoffResponse,
  GetIncidentResponse,
  GetTimelineResponse,
  Id,
  ListIncidentsQuery,
  ListIncidentsResponse,
  RecordActionRequest,
  RecordActionResponse,
  UpdateIncidentRequest,
  UpdateIncidentResponse,
  VoiceTurnRequest,
  VoiceTurnResponse,
} from '@voicesos/shared';
import { apiGet, apiPatch, apiPost, type ApiRequestOptions } from './client';

function toQuery(params: ListIncidentsQuery = {}): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.emergencyType) search.set('emergencyType', params.emergencyType);
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.offset !== undefined) search.set('offset', String(params.offset));
  const value = search.toString();
  return value ? `?${value}` : '';
}

/** Typed incident endpoints from Task 3 / task.md Phase 8. */
export const incidentsApi = {
  create(
    body: CreateIncidentRequest,
    options?: ApiRequestOptions,
  ): Promise<CreateIncidentResponse> {
    return apiPost<CreateIncidentResponse>('/api/incidents', body, options);
  },

  getById(id: Id, options?: ApiRequestOptions): Promise<GetIncidentResponse> {
    return apiGet<GetIncidentResponse>(`/api/incidents/${id}`, options);
  },

  update(
    id: Id,
    body: UpdateIncidentRequest,
    options?: ApiRequestOptions,
  ): Promise<UpdateIncidentResponse> {
    return apiPatch<UpdateIncidentResponse>(`/api/incidents/${id}`, body, options);
  },

  list(
    query: ListIncidentsQuery = {},
    options?: ApiRequestOptions,
  ): Promise<ListIncidentsResponse> {
    return apiGet<ListIncidentsResponse>(`/api/incidents${toQuery(query)}`, options);
  },

  listForResponder(
    query: ListIncidentsQuery = {},
    options?: ApiRequestOptions,
  ): Promise<ListIncidentsResponse> {
    return apiGet<ListIncidentsResponse>(
      `/api/responder/incidents${toQuery(query)}`,
      options,
    );
  },

  getForResponder(
    id: Id,
    options?: ApiRequestOptions,
  ): Promise<GetIncidentResponse> {
    return apiGet<GetIncidentResponse>(`/api/responder/incidents/${id}`, options);
  },

  addMessage(
    id: Id,
    body: AddMessageRequest,
    options?: ApiRequestOptions,
  ): Promise<AddMessageResponse> {
    return apiPost<AddMessageResponse>(`/api/incidents/${id}/messages`, body, options);
  },

  recordAction(
    id: Id,
    body: RecordActionRequest,
    options?: ApiRequestOptions,
  ): Promise<RecordActionResponse> {
    return apiPost<RecordActionResponse>(`/api/incidents/${id}/actions`, body, options);
  },

  getTimeline(id: Id, options?: ApiRequestOptions): Promise<GetTimelineResponse> {
    return apiGet<GetTimelineResponse>(`/api/incidents/${id}/timeline`, options);
  },

  getHandoff(id: Id, options?: ApiRequestOptions): Promise<GetHandoffResponse> {
    return apiGet<GetHandoffResponse>(`/api/incidents/${id}/handoff`, options);
  },

  voiceTurn(
    id: Id,
    body: VoiceTurnRequest = {},
    options?: ApiRequestOptions,
  ): Promise<VoiceTurnResponse> {
    return apiPost<VoiceTurnResponse>(`/api/incidents/${id}/voice`, body, options);
  },
};
