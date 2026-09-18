import { isApiSuccess, type ApiResponse, type HealthResponse } from '@voicesos/shared';
import { getApiBaseUrl } from './config';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;

  constructor(status: number, code: string, message: string, requestId: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/**
 * Thin HTTP helper that understands the shared `ApiResponse` envelope.
 *
 * Task 19 expands this into typed resource clients, loading/retry, and UI error mapping.
 * Task 18 only needs the boundary and a working health check against the scaffolded server.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      response.status,
      'INTERNAL_ERROR',
      'Response was not valid JSON',
      'unknown',
    );
  }

  if (!isApiSuccess(body)) {
    throw new ApiClientError(
      response.status,
      body.error.code,
      body.error.message,
      body.requestId,
    );
  }

  return body.data;
}

/** `GET /api/health` — verifies the frontend can talk to the Task 1 backend. */
export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/api/health');
}
