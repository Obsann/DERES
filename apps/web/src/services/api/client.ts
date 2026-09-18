import {
  ApiErrorCode,
  type ApiError,
  type ApiFieldError,
  type ApiResponse,
  isApiSuccess,
} from '@voicesos/shared';
import { getApiBaseUrl } from './config';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Override default retry count for this call. */
  retries?: number;
  /** Skip retries even for retryable failures. */
  skipRetry?: boolean;
}

/**
 * Typed failure from the DERES API (or from the network before a response).
 *
 * UI code should catch this (or read it from a query/mutation error) and render
 * a controlled state — never let it bubble as an uncaught exception in React.
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly requestId: string;
  readonly fieldErrors: ApiFieldError[];
  readonly causeKind: 'http' | 'network' | 'parse' | 'aborted';

  constructor(input: {
    status: number;
    code: ApiErrorCode;
    message: string;
    requestId?: string;
    fieldErrors?: ApiFieldError[];
    causeKind?: ApiClientError['causeKind'];
  }) {
    super(input.message);
    this.name = 'ApiClientError';
    this.status = input.status;
    this.code = input.code;
    this.requestId = input.requestId ?? 'unknown';
    this.fieldErrors = input.fieldErrors ?? [];
    this.causeKind = input.causeKind ?? 'http';
  }

  get isNetworkError(): boolean {
    return this.causeKind === 'network';
  }

  get isNotFound(): boolean {
    return this.code === ApiErrorCode.NOT_FOUND;
  }

  get isRetryable(): boolean {
    if (this.causeKind === 'aborted') return false;
    if (this.causeKind === 'network') return true;
    if (this.code === ApiErrorCode.UPSTREAM_UNAVAILABLE) return true;
    if (this.code === ApiErrorCode.RATE_LIMITED) return true;
    if (this.status >= 500) return true;
    return false;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

/** User-facing copy. Prefer this over `error.message` in emergency UI. */
export function toUiErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) {
    return 'Something went wrong. Please try again.';
  }

  switch (error.code) {
    case ApiErrorCode.NOT_FOUND:
      return 'We could not find that incident.';
    case ApiErrorCode.UNAUTHORIZED:
    case ApiErrorCode.FORBIDDEN:
      return 'You are not allowed to view this.';
    case ApiErrorCode.VALIDATION_ERROR:
      return error.fieldErrors[0]?.message ?? 'Please check the information and try again.';
    case ApiErrorCode.RATE_LIMITED:
      return 'Too many requests. Wait a moment and try again.';
    case ApiErrorCode.UPSTREAM_UNAVAILABLE:
      return 'A required service is temporarily unavailable. Please try again.';
    case ApiErrorCode.INVALID_STATE_TRANSITION:
    case ApiErrorCode.PROTOCOL_VIOLATION:
    case ApiErrorCode.AI_VALIDATION_FAILED:
      return error.message;
    case ApiErrorCode.CONFLICT:
      return 'This incident changed. Refresh and try again.';
    default:
      if (error.isNetworkError) {
        return 'No connection. Check your network and try again.';
      }
      return 'Something went wrong. Please try again.';
  }
}

const DEFAULT_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalised}`;
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError({
      status: response.status,
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'Response was not valid JSON',
      causeKind: 'parse',
    });
  }
}

function toClientError<T>(response: Response, body: ApiResponse<T>): ApiClientError {
  if (isApiSuccess(body)) {
    return new ApiClientError({
      status: response.status,
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'Expected an error envelope but received success',
      requestId: body.requestId,
    });
  }

  const error: ApiError = body.error;
  return new ApiClientError({
    status: response.status,
    code: error.code,
    message: error.message,
    requestId: body.requestId,
    fieldErrors: error.fieldErrors,
    causeKind: 'http',
  });
}

async function executeOnce<T>(path: string, init: ApiRequestOptions): Promise<T> {
  const { body, headers, retries: _retries, skipRetry: _skip, ...rest } = init;

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw new ApiClientError({
        status: 0,
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Request was cancelled',
        causeKind: 'aborted',
      });
    }

    throw new ApiClientError({
      status: 0,
      code: ApiErrorCode.UPSTREAM_UNAVAILABLE,
      message: 'Network request failed',
      causeKind: 'network',
    });
  }

  const parsed = await parseApiResponse<T>(response);

  if (!response.ok || !isApiSuccess(parsed)) {
    throw toClientError(response, parsed);
  }

  return parsed.data;
}

/**
 * HTTP helper that understands the shared `ApiResponse` envelope.
 *
 * Retries transient network / 5xx / upstream failures with short backoff.
 * Always throws {@link ApiClientError} so UI layers can render controlled states.
 */
export async function apiRequest<T>(
  path: string,
  init: ApiRequestOptions = {},
): Promise<T> {
  const maxAttempts = init.skipRetry ? 1 : (init.retries ?? DEFAULT_RETRIES) + 1;
  let attempt = 0;
  let lastError: ApiClientError | undefined;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await executeOnce<T>(path, init);
    } catch (error) {
      if (!isApiClientError(error)) {
        throw new ApiClientError({
          status: 0,
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown client error',
        });
      }

      lastError = error;
      const canRetry = !init.skipRetry && error.isRetryable && attempt < maxAttempts;
      if (!canRetry) throw error;

      await sleep(250 * attempt);
    }
  }

  throw lastError ?? new ApiClientError({
    status: 0,
    code: ApiErrorCode.INTERNAL_ERROR,
    message: 'Request failed',
  });
}

export function apiGet<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'GET' });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  init: ApiRequestOptions = {},
): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'POST', body });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  init: ApiRequestOptions = {},
): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'PATCH', body });
}
