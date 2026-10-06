import { UpstreamUnavailableError } from './errors.js';
import { logger } from './logger.js';

/**
 * HTTP to an external provider while a person waits on the other end of the turn.
 * Every failure, including a timeout mid-body, surfaces as
 * `UpstreamUnavailableError` so the turn falls back to a safe spoken line.
 */

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export interface UpstreamRequest {
  dependency: string;
  url: string;
  init: RequestInit;
  /** Per attempt, including reading the body. */
  timeoutMs: number;
  maxAttempts?: number;
  /** A rate limit asking for longer than this fails now instead of adding silence. */
  maxRetryAfterMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Retries only transient statuses; a 400 would fail the same way again.
 * Returns the last response, ok or not, for the caller to interpret.
 */
export async function fetchWithRetry(request: UpstreamRequest): Promise<Response> {
  const { dependency, url, init, timeoutMs } = request;
  const maxAttempts = request.maxAttempts ?? 3;
  const maxRetryAfterMs = request.maxRetryAfterMs ?? 10_000;
  const fetchImpl = request.fetchImpl ?? fetch;
  let last: Response | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response: Response;
    try {
      // A fresh signal per attempt: a shared one is already spent on the retry.
      response = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch (cause) {
      if (attempt === maxAttempts) {
        logger.warn(`${dependency} unreachable`, { timedOut: isTimeout(cause) });
        throw new UpstreamUnavailableError(dependency, { cause });
      }
      await delay(backoffMs(attempt));
      continue;
    }

    if (response.ok || !RETRYABLE_STATUSES.has(response.status)) return response;
    last = response;

    const askedFor = retryAfterMs(response);
    if (askedFor !== null && askedFor > maxRetryAfterMs) break;
    if (attempt < maxAttempts) await delay(askedFor ?? backoffMs(attempt));
  }

  if (!last) throw new UpstreamUnavailableError(dependency);
  return last;
}

/** The attempt's timeout also covers the body, which can still be arriving when it fires. */
export async function readJson<T>(response: Response, dependency: string): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (cause) {
    logger.warn(`${dependency} response unreadable`, { timedOut: isTimeout(cause) });
    throw new UpstreamUnavailableError(dependency, { cause });
  }
}

/** Delay-seconds or an HTTP date, per RFC 9110. */
function retryAfterMs(response: Response): number | null {
  const header = response.headers.get('retry-after');
  if (!header) return null;
  const seconds = Number(header);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? ms : null;
}

function isTimeout(cause: unknown): boolean {
  return cause instanceof Error && cause.name === 'TimeoutError';
}

function backoffMs(attempt: number): number {
  return 250 * 2 ** (attempt - 1);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
