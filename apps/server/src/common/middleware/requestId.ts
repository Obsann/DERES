import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const HEADER = 'x-request-id';

/**
 * Gives every request a correlation id and echoes it back.
 *
 * The same id appears in the response envelope and in every log line for the
 * request, so a user-reported failure can be traced to its logs.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get(HEADER);
  const id = incoming && incoming.length <= 128 ? incoming : randomUUID();
  res.locals['requestId'] = id;
  res.setHeader(HEADER, id);
  next();
}
