import { createHmac, timingSafeEqual } from 'node:crypto';
import { UserRole, type Id } from '@voicesos/shared';
import { config } from '../common/config.js';
import { UnauthorizedError } from '../common/errors.js';

export interface AuthTokenPayload {
  sub: Id;
  role: UserRole;
  exp: number;
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(body: string): string {
  return createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
}

export function issueResponderToken(userId: Id, role: UserRole, ttlSeconds = 86_400): string {
  if (role !== UserRole.RESPONDER && role !== UserRole.ADMIN) {
    throw new UnauthorizedError('Only responder or admin tokens can be issued');
  }
  const payload: AuthTokenPayload = {
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = encode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyResponderToken(token: string): AuthTokenPayload {
  const [body, signature] = token.split('.');
  if (!body || !signature) {
    throw new UnauthorizedError('Authentication required');
  }
  const expected = sign(body);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new UnauthorizedError('Authentication required');
  }
  let payload: AuthTokenPayload;
  try {
    payload = JSON.parse(decode(body)) as AuthTokenPayload;
  } catch {
    throw new UnauthorizedError('Authentication required');
  }
  if (payload.exp * 1000 < Date.now()) {
    throw new UnauthorizedError('Session expired');
  }
  if (payload.role !== UserRole.RESPONDER && payload.role !== UserRole.ADMIN) {
    throw new UnauthorizedError('Authentication required');
  }
  return payload;
}

export function invitesMatch(provided: string, expected: string | null): boolean {
  if (expected === null || expected === '') return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
