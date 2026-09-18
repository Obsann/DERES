import type { Response } from 'express';
import type { ApiError, ApiErrorResponse, ApiSuccessResponse } from '@voicesos/shared';

/** Correlation id assigned to the request by the `requestId` middleware. */
export function getRequestId(res: Response): string {
  const value: unknown = res.locals['requestId'];
  return typeof value === 'string' ? value : 'unknown';
}

/**
 * Sends the success branch of the shared `ApiResponse` envelope.
 *
 * Every route replies through this helper or the error handler, so the client
 * only ever has to handle one response shape.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiSuccessResponse<T> = {
    ok: true,
    data,
    requestId: getRequestId(res),
  };
  res.status(statusCode).json(body);
}

/** Sends the failure branch of the shared `ApiResponse` envelope. */
export function sendError(res: Response, error: ApiError, statusCode: number): void {
  const body: ApiErrorResponse = {
    ok: false,
    error,
    requestId: getRequestId(res),
  };
  res.status(statusCode).json(body);
}
