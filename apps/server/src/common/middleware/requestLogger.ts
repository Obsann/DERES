import type { NextFunction, Request, Response } from 'express';
import { logger } from '../logger.js';
import { getRequestId } from '../http.js';

/**
 * Logs one line per completed request.
 *
 * Deliberately records only method, route, status and duration. Request bodies
 * carry emergency conversation content and are never logged.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const context = {
      requestId: getRequestId(res),
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    };

    if (res.statusCode >= 500) logger.error('request failed', context);
    else if (res.statusCode >= 400) logger.warn('request rejected', context);
    else logger.info('request completed', context);
  });

  next();
}
