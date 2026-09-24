import type {
  CreateSessionRequest,
  CreateSessionResponse,
  HealthResponse,
} from '@voicesos/shared';
import { apiGet, apiPost, type ApiRequestOptions } from './client';

export function getHealth(options?: ApiRequestOptions): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/api/health', {
    ...options,
    // Health is used for connection probing — fail fast.
    skipRetry: options?.skipRetry ?? true,
  });
}

export const sessionsApi = {
  create(
    body: CreateSessionRequest,
    options?: ApiRequestOptions,
  ): Promise<CreateSessionResponse> {
    return apiPost<CreateSessionResponse>('/api/sessions', body, options);
  },
};
