import { describe, expect, it } from 'vitest';
import { UserRole } from '@voicesos/shared';
import { UnauthorizedError } from '../common/errors.js';
import { issueResponderToken, verifyResponderToken, invitesMatch } from './tokens.js';

describe('responder tokens', () => {
  it('issues a token that verifies as responder and rejects a tampered one', () => {
    const token = issueResponderToken('user-1', UserRole.RESPONDER);
    const payload = verifyResponderToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe(UserRole.RESPONDER);

    expect(() => verifyResponderToken(`${token}x`)).toThrow(UnauthorizedError);
    expect(() => verifyResponderToken('not-a-token')).toThrow(UnauthorizedError);
  });

  it('does not treat a USER role as a responder token', () => {
    expect(() => issueResponderToken('user-2', UserRole.USER)).toThrow(UnauthorizedError);
  });

  it('compares invites in constant time and rejects a miss', () => {
    expect(invitesMatch('secret-invite', 'secret-invite')).toBe(true);
    expect(invitesMatch('secret-invite', 'other-invite')).toBe(false);
    expect(invitesMatch('secret-invite', null)).toBe(false);
  });
});
