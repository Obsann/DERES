import type { NextFunction, Request, Response } from 'express';
import { ApiErrorCode, type ApiError } from '@voicesos/shared';
import { AppError } from '../errors.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { getRequestId, sendError } from '../http.js';

/** Terminal 404 for an unmatched route. */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    { code: ApiErrorCode.NOT_FOUND, message: `No route for ${req.method} ${req.path}` },
    404,
  );
}

/**
 * The single place an error becomes an HTTP response.
 *
 * A deliberate `AppError` is reported with its own code and status. Anything
 * else is a bug: it is logged with its stack and returned as a generic
 * `INTERNAL_ERROR`, so an unexpected failure cannot leak internal detail to a
 * client.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestId = getRequestId(res);

  if (error instanceof AppError) {
    const body: ApiError = {
      code: error.code,
      message: error.message,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    };

    logger.warn('handled application error', {
      requestId,
      code: error.code,
      status: error.statusCode,
      message: error.message,
      ...error.logContext,
    });

    sendError(res, body, error.statusCode);
    return;
  }

  logger.error('unhandled error', {
    requestId,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  sendError(
    res,
    {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: config.isProduction
        ? 'Something went wrong. The incident was logged.'
        : error instanceof Error
          ? error.message
          : String(error),
    },
    500,
  );
}
