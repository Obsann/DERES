import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '@voicesos/shared';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';
import { isDatabaseConnected } from '../database/connection.js';
import { getUserById } from '../database/persist.js';
import { hasRole, type Principal } from './principal.js';
import { verifyResponderToken } from './tokens.js';

export function readPrincipal(res: Response): Principal | undefined {
  const value = res.locals['principal'] as Principal | undefined;
  return value;
}

export function setPrincipal(res: Response, principal: Principal): void {
  res.locals['principal'] = principal;
}

function bearerToken(req: Request): string | null {
  const header = req.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() ?? null;
}

/** Attaches a responder/admin principal when a valid bearer token is present. */
export async function attachPrincipal(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = bearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyResponderToken(token);
    if (!isDatabaseConnected()) {
      throw new UnauthorizedError('Authentication required');
    }
    const user = await getUserById(payload.sub);
    if (user.role !== payload.role) {
      throw new UnauthorizedError('Authentication required');
    }
    setPrincipal(res, { kind: 'user', user });
    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Authentication required'));
  }
}

export function requireResponder(req: Request, res: Response, next: NextFunction): void {
  const principal = readPrincipal(res);
  if (!principal) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }
  if (!hasRole(principal, [UserRole.RESPONDER, UserRole.ADMIN])) {
    next(new ForbiddenError('Responder access only'));
    return;
  }
  next();
}
