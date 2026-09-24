import type { AuthUser, Id, UserRole } from '@voicesos/shared';

export type Principal =
  | { kind: 'anonymous'; sessionId: Id }
  | { kind: 'user'; user: AuthUser };

export function hasRole(principal: Principal | undefined, roles: UserRole[]): boolean {
  return principal?.kind === 'user' && roles.includes(principal.user.role);
}
