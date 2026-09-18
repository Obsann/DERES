import type { Language, UserRole } from '../enums/index.js';
import type { Id, IsoDateTime } from './common.js';

/** An authenticated principal (specification section 19). */
export interface AuthUser {
  id: Id;
  role: UserRole;
  /** Null for anonymous bystanders, who are never asked to identify themselves. */
  displayName: string | null;
  email: string | null;
  preferredLanguage: Language;
  createdAt: IsoDateTime;
}

/**
 * A browser or voice session.
 *
 * The emergency flow is session-based and anonymous; `userId` is only set for
 * responders and admins who signed in.
 */
export interface Session {
  id: Id;
  userId: Id | null;
  language: Language;
  createdAt: IsoDateTime;
  lastSeenAt: IsoDateTime;
  expiresAt: IsoDateTime;
}
